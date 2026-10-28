import time
import unittest
from unittest.mock import patch
from app import app
import contact_mail as mail

class ContactTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        mail._attempts.clear()
        mail._used.clear()
        self.values = dict(name='Pessoa de teste', email='visitor@example.com', phone='', company='', project='Auditoria', message='Solicitação de teste', website='')
        self.token = mail._signer.dumps({'nonce':'test-nonce', 'issued': time.time()-3})

    def post(self, **changes):
        return self.client.post('/api/contact', json={**self.values, **changes}, headers={'X-Contact-Token':self.token, 'Origin':'http://localhost'})

    def test_success_and_replay(self):
        with patch('contact_mail.deliver') as deliver:
            self.assertEqual(self.post().status_code, 200)
            self.assertEqual(self.post().status_code, 409)
            deliver.assert_called_once()

    def test_required_email_limits_and_header_injection(self):
        for values in ({'name':''}, {'email':'bad'}, {'email':'a@example.com\r\nBcc: x@example.com'}, {'name':'A\nB'}, {'message':'x'*3001}, {'project':''}, {'phone':123}, {'message':''}):
            mail._attempts.clear()
            with self.subTest(values=values), patch('contact_mail.deliver') as deliver:
                self.assertEqual(self.post(**values).status_code, 400)
                deliver.assert_not_called()

    def test_origin_token_age_and_honeypot(self):
        with patch('contact_mail.deliver') as deliver:
            self.assertEqual(self.client.post('/api/contact',json=self.values,headers={'Origin':'https://evil.example'}).status_code,403)
            self.assertEqual(self.client.post('/api/contact',json=self.values).status_code,403)
            self.assertEqual(self.post(website='spam').status_code,400)
            self.token=mail._signer.dumps({'nonce':'new', 'issued':time.time()})
            self.assertEqual(self.post().status_code,400)
            self.assertEqual(self.client.get('/api/contact/token').headers['Cache-Control'],'no-store')
            deliver.assert_not_called()

    def test_rate_limit(self):
        for _ in range(5):
            self.client.post('/api/contact',json={})
        response=self.post()
        self.assertEqual(response.status_code,429)
        self.assertEqual(response.headers['Retry-After'],'600')

    def test_expired_and_large_invalid_requests(self):
        with patch('contact_mail._signer.loads',side_effect=mail.SignatureExpired('expired')):
            self.assertEqual(self.post().status_code,403)
        self.assertEqual(self.client.post('/api/contact',data='x'*20001,content_type='application/json').status_code,413)
        self.assertEqual(self.client.post('/api/contact',json=[]).status_code,400)

    def test_failure_no_success_or_sensitive_response(self):
        with patch('contact_mail.deliver',side_effect=RuntimeError('SECRET recipient@example.com')):
            response=self.post()
            self.assertEqual(response.status_code,503)
            self.assertNotIn('SECRET',response.get_data(as_text=True))
            self.assertNotIn('recipient@',response.get_data(as_text=True))

    def resend_config(self):
        # Reserved example domain and dummy credential: mocks only, never production.
        return dict(RESEND_API_KEY='mock-only-not-a-secret', RESEND_FROM_EMAIL='contact@example.com',
                    CONTACT_TO_EMAIL='coderland.software@gmail.com')

    def setup_response(self, transport, status=200, body=b'{"id":"mock-email-id"}'):
        response=transport.return_value.getresponse.return_value
        response.status=status
        response.read.return_value=body
        return transport.return_value

    def test_resend_https_and_reply_to(self):
        import json
        with app.app_context(), patch.dict(app.config,self.resend_config()), patch('contact_mail.http.client.HTTPSConnection') as transport:
            connection=self.setup_response(transport)
            mail.deliver(self.values)
            self.assertEqual(transport.call_args.args,('api.resend.com',))
            self.assertEqual(transport.call_args.kwargs['timeout'],12)
            self.assertTrue(transport.call_args.kwargs['context'].check_hostname)
            args=connection.request.call_args
            self.assertEqual(args.args,('POST','/emails'))
            payload=json.loads(args.kwargs['body'])
            self.assertEqual(payload['reply_to'],'visitor@example.com')
            self.assertEqual(payload['from'],'contact@example.com')
            self.assertEqual(payload['to'],['coderland.software@gmail.com'])
            self.assertIn('Solicitação de teste',payload['text'])
            self.assertEqual(args.kwargs['headers']['Authorization'],'Bearer mock-only-not-a-secret')
            connection.close.assert_called_once()

    def test_missing_configuration_fails_closed(self):
        with app.app_context(), patch.dict(app.config,{'RESEND_API_KEY':''}), patch('contact_mail.http.client.HTTPSConnection') as transport:
            with self.assertRaises(RuntimeError): mail.deliver(self.values)
            transport.assert_not_called()

    def test_api_acceptance_required(self):
        for body in (b'{"id":"mock-id"}',b'{}',b'{"id":""}',b'{"error":"rejected"}',b'not json',b'[]'):
            mail._used.clear()
            mail._attempts.clear()
            with self.subTest(body=body), patch.dict(app.config,self.resend_config()), patch('contact_mail.http.client.HTTPSConnection') as transport:
                self.setup_response(transport,body=body)
                self.assertEqual(self.post().status_code,200 if body==b'{"id":"mock-id"}' else 503)

    def test_api_authentication_failure_is_safe(self):
        for status in (401,403):
            mail._used.clear()
            mail._attempts.clear()
            with patch.dict(app.config,self.resend_config()), patch('contact_mail.http.client.HTTPSConnection') as transport:
                self.setup_response(transport,status,b'mock-private-diagnostic')
                with self.assertLogs(app.logger,level='WARNING') as logs:
                    response=self.post()
                self.assertEqual(response.status_code,503)
                self.assertNotIn('mock-private-diagnostic',response.get_data(as_text=True)+' '.join(logs.output))
                self.assertNotIn('message',response.json)

    def test_api_timeout_unavailable_rejected_redirect(self):
        for failure in ('connect','timeout',422,429,500,503,302):
            mail._used.clear()
            mail._attempts.clear()
            with self.subTest(failure=failure), patch.dict(app.config,self.resend_config()), patch('contact_mail.http.client.HTTPSConnection') as transport:
                connection=self.setup_response(transport,status=failure if isinstance(failure,int) else 200)
                if failure=='connect': connection.request.side_effect=OSError('mock unreachable')
                elif failure=='timeout': connection.getresponse.side_effect=TimeoutError('mock timeout')
                response=self.post()
                self.assertEqual(response.status_code,503)
                self.assertNotIn('message',response.json)
                connection.request.assert_called_once()
                connection.close.assert_called_once()

    def test_unconfigured_or_public_sender_not_used(self):
        for sender in ('','coderland.software@gmail.com','onboarding@resend.dev','bad'):
            with app.app_context(), patch.dict(app.config,{**self.resend_config(),'RESEND_FROM_EMAIL':sender}), patch('contact_mail.http.client.HTTPSConnection') as transport:
                with self.assertRaises(RuntimeError): mail.deliver(self.values)
                transport.assert_not_called()
