const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('static/js/app.min.js','utf8');
const site=JSON.parse(fs.readFileSync('data/site.json','utf8'));
let calls=[],states=[],refs=[],stateIndex=0,refIndex=0;
const values={name:'Teste',email:'test@example.com',phone:'',company:'',project:'Auditoria',message:'Mock only'};
const context={window:{__CODERLAND_SITE__:site},document:{getElementById:()=>({})},
 React:{createElement:(type,props,...children)=>({type,props:props||{},children}),useState:initial=>{const i=stateIndex++;if(!(i in states))states[i]=initial;return[states[i],v=>states[i]=v]},useRef:initial=>{const i=refIndex++;return refs[i]||(refs[i]={current:initial})}},
 ReactDOM:{createRoot:()=>({render(){}})},AbortController,setTimeout,clearTimeout,URL,
 FormData:class {constructor(form){return Object.entries(form.values)}},
 fetch:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({success:true})}}};
vm.createContext(context);vm.runInContext(source,context);
const send=values=>{context.testValues=values;return vm.runInContext('sendWeb3Contact(testValues)',context)};
const find=(node,type)=>node&&node.type===type?node:node?.children?.flat(Infinity).map(n=>find(n,type)).find(Boolean);
function render(){stateIndex=0;refIndex=0;return vm.runInContext('Contact()',context)}
(async()=>{
 await send(values);assert.equal(calls[0].url,'https://api.web3forms.com/submit');
 const payload=JSON.parse(calls[0].options.body);assert.equal(payload.email,values.email);assert.equal(payload.replyto,values.email);assert.equal(payload.phone,'');assert.ok(payload.access_key);assert.equal(payload.subject,'Novo contato — Coderland');assert.equal(calls[0].options.credentials,'omit');
 for(const result of [false,'true',null,{},undefined]){context.fetch=async()=>({ok:true,json:async()=>({success:result})});await assert.rejects(send(values));}
 context.fetch=async()=>({ok:false,json:async()=>({success:true})});await assert.rejects(send(values));
 context.fetch=async()=>({ok:true,json:async()=>{throw new SyntaxError('invalid JSON')}});await assert.rejects(send(values));
 context.fetch=async()=>{throw new TypeError('network failure')};await assert.rejects(send(values));
 let timer;context.setTimeout=fn=>{timer=fn;return 1};context.clearTimeout=()=>{};
 context.fetch=()=>new Promise(()=>{});const stalled=send(values);timer();await assert.rejects(stalled);
 context.setTimeout=setTimeout;context.clearTimeout=clearTimeout;
 for(const invalid of [{name:'  '},{email:'bad'},{project:''},{message:'x'.repeat(3001)}]) await assert.rejects(send({...values,...invalid}));
 let requested=0;context.fetch=async()=>{requested++;return{ok:true,json:async()=>({success:true})}};await assert.rejects(send({...values,botcheck:'on'}));assert.equal(requested,0);
 let resolve;context.fetch=()=>{requested++;return new Promise(r=>resolve=r)};
 const form={values,reportValidity:()=>true,reset(){this.resets=(this.resets||0)+1}};
 const submit=find(render(),'form').props.onSubmit;const event={preventDefault(){},currentTarget:form};
 const first=submit(event);await submit(event);assert.equal(requested,1);assert.equal(find(render(),'button').props.disabled,true);assert.equal(states[0],'sending');
 resolve({ok:true,json:async()=>({success:true})});await first;assert.equal(states[0],'success');assert.equal(form.resets,1);
 context.fetch=async()=>({ok:true,json:async()=>({success:false,message:'private provider diagnostic'})});await submit(event);assert.equal(states[0],'');assert.equal(form.resets,1);assert.equal(states[1],'Não foi possível enviar. Tente novamente.');assert.equal(form.values,values);
 form.reportValidity=()=>false;requested=0;context.fetch=async()=>{requested++};await submit(event);assert.equal(requested,0);
 console.log('Web3Forms: payload, strict success, HTTP errors, malformed JSON, network, timeout, honeypot, duplicate lock, loading, reset and preserved fields passed (all mocked).');
})().catch(e=>{console.error(e);process.exitCode=1});
