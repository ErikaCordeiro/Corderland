// React source. Compile with node scripts/build.cjs before preview or deployment.
const DEFAULT_SITE = window.__CODERLAND_SITE__;

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildSiteKnowledge() {
  const scrapedSections = Array.from(document.querySelectorAll("main section, footer"))
    .map((section) => section.innerText.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;

  const productContent = (data.projects || []).map((project) => ({
    title: project.name,
    text: `${project.name}: ${project.eyebrow}. ${project.description} ${project.items.join(", ")}.`,
  }));

  const serviceContent = (data.services || []).map((service) => ({
    title: service,
    text: `A Coderland trabalha com ${service.toLowerCase()}.`,
  }));

  return [
    {title: "Contato WhatsApp telefone", text: `Fale com a Coderland pelo WhatsApp ${data.whatsapp.phoneDisplay}. Conte sua ideia para encontrarmos a melhor solução.`,},
    ...productContent,
    ...serviceContent,
    ...scrapedSections.map((text, index) => ({ title: `Conteúdo do site ${index + 1}`, text })),
  ];
}

const chatStopWords = new Set([
  "como",
  "com",
  "para",
  "por",
  "que",
  "quais",
  "qual",
  "uma",
  "uns",
  "das",
  "dos",
  "vocês",
  "voces",
  "vendem",
  "vende",
  "fazer",
  "faz",
  "tem",
  "sobre",
  "empresa",
  "coderland",
]);

function LogoMark() {
  return <img className="logo-mark logo-image" src="/static/images/brand/coderland-logo-64.png" srcSet="/static/images/brand/coderland-logo-64.png 1x, /static/images/brand/coderland-logo-128.png 2x" alt="Logo da Coderland" width="34" height="34" decoding="async"/>;
}

function SiteChat() {
  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;
  const whatsappLink = whatsappHref();
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([
    {
      from: "bot",
      text: "Olá, sou o assistente da Coderland. Posso responder sobre soluções, auditorias, automações, sites e projetos.",
    },
  ]);

  const toggleRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const logRef = React.useRef(null);
  React.useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const close = e => { if (e.key === 'Escape') { setIsOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [isOpen]);
  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, isOpen]);

  function findAnswer(question) {
    const normalizedQuestion = normalizeText(question);
    const knowledge = buildSiteKnowledge();
    const words = normalizedQuestion
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !chatStopWords.has(word));

    if (words.length === 0) {
      return {
        text:
          "Não encontrei detalhes suficientes para responder pelo site. Me chame no WhatsApp para continuarmos.",
        fallback: true,
      };
    }

    const ranked = knowledge
      .map((item) => {
        const normalizedText = normalizeText(`${item.title} ${item.text}`);
        const score = words.reduce((total, word) => total + (normalizedText.includes(word) ? 1 : 0), 0);
        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score);

    if (!ranked[0] || ranked[0].score === 0) {
      return {
        text:
          "Não encontrei essa resposta no site. Para te atender melhor, fale direto com a Coderland pelo WhatsApp.",
        fallback: true,
      };
    }

    return {
      text: ranked[0].text,
      fallback: false,
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return;
    }

    const answer = findAnswer(cleanMessage);
    setMessages((currentMessages) => [
      ...currentMessages,
      { from: "user", text: cleanMessage },
      { from: "bot", text: answer.text, fallback: answer.fallback },
    ]);
    setMessage("");
    setIsOpen(true);
  }

  return (
    <div className={`site-chat ${isOpen ? "open" : ""}`}>
      {isOpen && (
        <section className="chat-panel" id="chat-panel" aria-label="Chat Coderland">
          <header>
            <div>
              <strong>Chat Coderland</strong>
              <span>Responde usando o conteúdo do site</span>
            </div>
            <button type="button" onClick={() => {setIsOpen(false);toggleRef.current?.focus();}} aria-label="Fechar chat">
              ×
            </button>
          </header>
          <div ref={logRef} className="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((chatMessage, index) => (
              <div className={`chat-message ${chatMessage.from}`} key={`${chatMessage.from}-${index}`}>
                <p>{chatMessage.text}</p>
                {chatMessage.fallback && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    Entrar em contato pelo WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              ref={inputRef}
              maxLength={600}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Digite sua dúvida"
              aria-label="Digite sua dúvida"
            />
            <button type="submit">Enviar</button>
          </form>
        </section>
      )}
      <button ref={toggleRef} className="chat-toggle" aria-expanded={isOpen} aria-controls="chat-panel" type="button" onClick={() => setIsOpen((current) => !current)}>
        {isOpen ? "Fechar" : "Chat"}
      </button>
    </div>
  );
}


const SITE = window.__CODERLAND_SITE__ || DEFAULT_SITE;
function whatsappHref(message = SITE.whatsapp.defaultMessage) {
  const url = new URL(SITE.whatsapp.waMe);
  if (message) url.searchParams.set('text', message);
  return url.toString();
}
const projectSlugs = ['fluxonland', 'hey-dev', 'lua-active', 'fitland'];
const links = [['solucoes','Soluções'],['auditorias','Auditorias'],['projetos','Projetos'],['metodo','Método'],['contato','Contato']];
const isProject = !!window.__PROJECT_SLUG__;
const homeLink = (id) => `${isProject ? '/' : ''}#${id}`;
const Arrow = () => <span aria-hidden="true">↗</span>;

function Icon({kind=0}) {
  const shapes = [<><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M8 13l-2 2 2 2m8-4 2 2-2 2"/></>,<><rect x="3" y="3" width="13" height="17" rx="2"/><rect x="13" y="10" width="8" height="12" rx="2"/><path d="M7 7h5M7 11h3"/></>,<><path d="M9 8H7a4 4 0 000 8h2m6-8h2a4 4 0 010 8h-2M8 12h8"/></>,<><path d="M13 2L4 14h7l-1 8 10-13h-7z"/></>,<><path d="M4 3v18h18M8 16v-5m5 5V6m5 10v-7"/></>,<><path d="M12 3l9 5v8l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v8"/></>];
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[kind%6]}</svg>;
}

function Header() {
  const [open,setOpen] = React.useState(false);
  const [active,setActive] = React.useState(isProject?'projetos':'');
  const [scrolled,setScrolled] = React.useState(false);
  const button = React.useRef(null);
  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      if(isProject){setActive('projetos');return;}
      const sections=[...document.querySelectorAll('main section[id]')];
      const current=sections.filter(section=>section.getBoundingClientRect().top<=window.innerHeight*.35).pop();
      setActive(current?.id||'');
    };
    onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);
    return ()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);};
  },[]);
  React.useEffect(()=>{
    if(!open)return;
    const focusTimer = setTimeout(() => document.querySelector('#main-nav a')?.focus(), 220);
    const close = e=>{if(e.key==='Escape'){setOpen(false);button.current?.focus();}};
    const outside = e=>{if(!e.target.closest('.site-header'))setOpen(false);};
    document.addEventListener('keydown',close);document.addEventListener('click',outside);
    return ()=>{clearTimeout(focusTimer);document.removeEventListener('keydown',close);document.removeEventListener('click',outside);};
  },[open]);
  return <header className={`site-header ${scrolled?'scrolled':''}`}><div className="header-inner">
    <a className="brand" href={homeLink('inicio')} aria-label="Coderland — início"><LogoMark/><span>Coderland</span></a>
    <nav id="main-nav" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)&&e.relatedTarget!==button.current)setOpen(false);}} className={open?'expanded':''} aria-label="Navegação principal">{links.map(([id,label])=><a key={id} href={homeLink(id)} aria-current={active===id?(isProject?'page':'location'):undefined} onClick={()=>setOpen(false)}>{label}</a>)}</nav>
    <a className="header-action" href={whatsappHref()} target="_blank" rel="noopener noreferrer">Falar agora <Arrow/></a>
    <button ref={button} className="menu-toggle" aria-label={open?'Fechar menu':'Abrir menu'} aria-controls="main-nav" aria-expanded={open} onClick={()=>setOpen(!open)}><span/><span/></button>
  </div></header>;
}

function TechVisual() {
  return <div className="tech-visual" role="img" aria-label="Composição conceitual: estratégia, sistemas e dados conectados a um núcleo de tecnologia">
    <svg className="tech-lines" viewBox="0 0 540 500" fill="none" aria-hidden="true"><defs><linearGradient id="beam"><stop stopColor="#A875F1" stopOpacity=".1"/><stop offset=".5" stopColor="#A875F1"/><stop offset="1" stopColor="#F3B334" stopOpacity=".2"/></linearGradient></defs><ellipse cx="270" cy="250" rx="215" ry="125" transform="rotate(-30 270 250)" stroke="#A875F1" strokeOpacity=".18"/><ellipse cx="270" cy="250" rx="215" ry="125" transform="rotate(30 270 250)" stroke="#A875F1" strokeOpacity=".18"/><path d="M90 160h70l110 90 110-90h70M80 350h90l100-100 100 100h80M270 65v370" stroke="url(#beam)" strokeWidth="1.5"/><circle cx="270" cy="250" r="154" stroke="#A875F1" strokeOpacity=".12" strokeDasharray="3 9"/><circle cx="270" cy="65" r="4" fill="#F3B334"/><circle cx="90" cy="160" r="4" fill="#A875F1"/><circle cx="450" cy="350" r="4" fill="#A875F1"/></svg>
    <div className="tech-core"><span className="core-code">&lt;/&gt;</span><small>CODERLAND</small></div>
    <div className="tech-label label-one"><Icon kind={5}/><div><small>O ponto de partida</small><strong>Estratégia</strong></div></div>
    <div className="tech-label label-two"><Icon kind={2}/><div><small>Tudo conectado</small><strong>Integração</strong></div></div>
    <div className="tech-label label-three"><Icon kind={3}/><div><small>Menos tarefas. Mais valor.</small><strong>Automação</strong></div></div>
    <span className="visual-footnote"><i/> Ideias conectadas. Negócios em evolução.</span>
  </div>;
}

function Hero() {
  return <section className="hero" id="inicio"><div className="hero-inner wrap"><div className="hero-copy"><p className="kicker"><span className="tiny-line"/> {SITE.hero.pill}</p><h1>Tecnologia que <em>transforma</em> negócios.</h1><p className="hero-description">{SITE.hero.subhead}</p><div className="hero-actions"><a className="primary-button" href="#contato">Iniciar um projeto <Arrow/></a><a className="text-link" href="#solucoes">Explorar soluções <span aria-hidden="true">↓</span></a></div><p className="hero-signature"><span/> Da estratégia à próxima versão do seu negócio.</p></div><TechVisual/></div><div className="hero-bottom wrap"><span>DESENVOLVIMENTO COM PROPÓSITO</span><div><span>Software sob medida</span><i/><span>Automação inteligente</span><i/><span>Evolução digital</span></div><a href="#solucoes" aria-label="Conhecer soluções">↓</a></div></section>;
}

const serviceDescriptions = [
  ['Sua presença digital com clareza, identidade e foco no seu negócio.','Apresentar. Conectar. Vender.'],
  ['Aplicações que acompanham sua operação em qualquer tamanho de tela.','Uma experiência em cada dispositivo.'],
  ['Conecte ferramentas e mantenha seus fluxos de informação alinhados.','Sistemas que trabalham juntos.'],
  ['Transforme tarefas repetitivas em rotinas digitais para sua operação.','Mais tempo para o que importa.'],
  ['Organize informações em painéis e relatórios para apoiar decisões.','Dados com contexto.'],
  ['Encontre caminhos de melhoria alinhados aos desafios da sua empresa.','Clareza para o próximo passo.']
];
function SectionHeading({number,label,title,description}) {return <div className="section-heading"><p className="kicker"><span>{number} /</span> {label}</p><h2>{title}</h2>{description&&<p className="section-subhead">{description}</p>}</div>;}
function Services() {
  return <section className="section wrap" id="solucoes"><div className="split-heading"><SectionHeading number="01" label="Soluções" title={<>Complexidade resolvida.<br/><em>Possibilidades ampliadas.</em></>}/><p className="section-subhead">Tecnologia que se adapta à sua empresa.<br/>Do primeiro site aos processos que sustentam sua operação.</p></div><div className="service-grid">{SITE.services.map((service,i)=><article className="service-card" key={service}><div className="card-top"><span className="service-icon"><Icon kind={i}/></span><span className="card-index">0{i+1}</span></div><h3>{service}</h3><p>{serviceDescriptions[i]?.[0]}</p><div className="service-bottom"><small>{serviceDescriptions[i]?.[1]}</small><a href={`#contato`} aria-label={`Conversar sobre ${service}`}><Arrow/></a></div></article>)}</div></section>;
}

function Audit() {
  return <section className="audit-shell" id="auditorias"><div className="section wrap audit-layout"><div><SectionHeading number="02" label="Auditorias" title={<>Antes de acelerar,<br/><em>entenda o caminho.</em></>}/><p className="section-subhead">{SITE.audit.subhead}</p><div className="audit-pillars">{SITE.audit.pillars.map((p,i)=><article key={p.title}><span>0{i+1}</span><div><h3>{p.title}</h3><p>{p.text}</p></div></article>)}</div><a className="text-link" href="#contato">Conversar sobre uma auditoria <Arrow/></a></div><div className="audit-dossier"><div className="dossier-heading"><span>CODERLAND / AUDITORIA</span><Icon kind={5}/></div><div className="dossier-graphic" aria-hidden="true"><svg viewBox="0 0 300 190" fill="none"><path d="M150 20l60 34v68l-60 35-60-35V54z" stroke="#A875F1" strokeWidth="1.5"/><path d="M150 46l38 22v43l-38 22-38-22V68z" stroke="#A875F1" strokeOpacity=".45"/><path d="M136 88l10 10 22-25" stroke="#F3B334" strokeWidth="3" strokeLinecap="round"/><path d="M30 88h60m120 0h60M150 0v20m0 137v33" stroke="#A875F1" strokeOpacity=".35"/><circle cx="30" cy="88" r="4" fill="#A875F1"/><circle cx="270" cy="88" r="4" fill="#F3B334"/></svg></div><p className="dossier-title">Uma visão completa.<br/>Um plano claro.</p><ol className="audit-steps">{SITE.audit.steps.map((s,i)=><li key={s.title}><span>0{i+1}</span><div><h3>{s.title}</h3><p>{s.text}</p></div><span aria-hidden="true">↗</span></li>)}</ol><p className="dossier-note">Processos · Sistemas · Riscos · Oportunidades</p></div></div></section>;
}

function FitlandBrand() {
  return <div className="fitland-brand"><span className="fitland-mark" aria-hidden="true">F</span><strong>FITLAND</strong></div>;
}
function FitlandVisual({project}) {
  return <figure className="project-visual visual-fitland">
    <span className="fitland-art-label" aria-hidden="true">MOVIMENTO<br/>COM DIREÇÃO.</span>
    <svg className="fitland-dumbbell" viewBox="0 0 120 120" fill="none" aria-hidden="true"><path d="M35 85l50-50M22 72l26 26M15 79l26 26M72 22l26 26M79 15l26 26" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/></svg>
    <div className="fitland-device"><div className="fitland-device-camera" aria-hidden="true"/><div className="fitland-screen"><FitlandBrand/><img src={project.capture.src} width={project.capture.width} height={project.capture.height} alt={project.capture.alt} loading={isProject?'eager':'lazy'} decoding="async"/><span className="fitland-screen-caption">PAINEL DE ATIVIDADE / RECORTE REAL</span></div></div>
    <span className="fitland-art-caption" aria-hidden="true">Treinos. Pessoas. Tecnologia.</span>
    <figcaption>Mockup ilustrativo · captura real do Fitland</figcaption>
  </figure>;
}
function ProjectVisual({index}) {
  if (SITE.projects[index].slug === 'fitland') return <FitlandVisual project={SITE.projects[index]}/>;
  return <figure className={`project-visual visual-${index}`}><div className="project-art" aria-hidden="true">
    {index===0?<><div className="flow-node node-source"><Icon kind={2}/><span>Sistemas</span></div><div className="flow-path"/><div className="flow-node node-center"><Icon kind={3}/><strong>Fluxonland</strong><span>Conectar → Automatizar</span></div><div className="flow-node node-data"><Icon kind={4}/><span>Operação</span></div><div className="flow-mini"><i/><i/><i/><i/><i/></div></>:index===1?<><div className="dev-window"><div className="window-chrome"><i/><i/><i/><span>hey dev / possibilidades</span></div><div className="dev-canvas"><span className="dev-symbol">&lt;<b>/</b>&gt;</span><span>Ideia. Código. Produto.</span><div className="dev-blocks"><i/><i/><i/></div></div></div><div className="dev-chip">web · sistemas · portais</div></>:<><div className="lua-moon"><span/></div><div className="lua-orbit"/><span className="lua-word">lua<span>active</span></span><div className="lua-tag"><i/> Inteligência em movimento</div></>}
    </div><figcaption>Representação conceitual · {SITE.projects[index].name}</figcaption></figure>;
}
function Projects() {
  return <section className="section wrap projects-section" id="projetos"><div className="split-heading"><SectionHeading number="03" label="Projetos & possibilidades" title={<>Ideias que ganham forma.<br/><em>Tecnologia que faz sentido.</em></>}/><p className="section-subhead">Projetos que conectam tecnologia aos desafios reais do seu negócio.</p></div><div className={`project-grid ${SITE.projects.length===4?'has-four':''}`}>{SITE.projects.map((p,i)=><article className={`project-card project-${i}`} key={p.name}><a className="project-image-link" href={`/projetos/${projectSlugs[i]}`} aria-label={`Conhecer ${p.name}`}><ProjectVisual index={i}/></a><div className="project-content"><p className="kicker">{p.eyebrow}</p><h3>{p.name}</h3><p>{p.description}</p><ul>{p.items.map(item=><li key={item}>{item}</li>)}</ul><a className="text-link" aria-label={`Conhecer projeto ${p.name}`} href={`/projetos/${projectSlugs[i]}`}>Conhecer projeto <Arrow/></a></div></article>)}</div></section>;
}
const method = [['Mapeamos','Entendemos vendas, atendimento, gestão e operação.','Contexto antes de código.'],['Construímos','Criamos a solução com backend, frontend e integrações.','Estratégia que vira entrega.'],['Evoluímos','Medimos, ajustamos e ampliamos conforme o uso real.','O próximo passo nasce do uso.']];
function Process() {
  return <section className="section wrap process-section" id="metodo"><SectionHeading number="04" label="Método Coderland" title={<>Boas soluções começam<br/><em>com as perguntas certas.</em></>}/><ol className="process-timeline">{method.map(([title,text,note],i)=><li key={title}><div className="step-marker"><span>0{i+1}</span><i/></div><h3>{title}</h3><p>{text}</p><small>{note}</small></li>)}</ol></section>;
}
// Web3Forms access keys are public identifiers, not private API credentials.
const WEB3FORMS_ACCESS_KEY = '015bad6e-7083-4293-a251-b7ebea88bdf2';
async function sendWeb3Contact(values) {
  if(values.botcheck) throw new Error('Invalid submission');
  const limits={name:120,email:254,phone:40,company:160,project:100,message:3000};
  values={...values};
  for(const [key,limit] of Object.entries(limits)) {
    const value=values[key]||'';
    if(typeof value!=='string'||value.length>limit||(key!=='message'&&/[\r\n\0]/.test(value))) throw new Error('Invalid field');
    values[key]=value.trim();
  }
  if(!values.name||!values.project||!values.message||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) throw new Error('Required fields');
  const controller=new AbortController();
  let timer;
  try {
    return await Promise.race([
      (async()=>{
        const response=await fetch('https://api.web3forms.com/submit',{
          method:'POST',credentials:'omit',redirect:'error',signal:controller.signal,
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify({access_key:WEB3FORMS_ACCESS_KEY,
            subject:'Novo contato — Coderland',from_name:'Coderland',
            name:values.name,email:values.email,replyto:values.email,
            phone:values.phone||'',company:values.company||'',
            project:values.project,message:values.message,botcheck:values.botcheck||''})
        });
        const result=await response.json();
        if(!response.ok||!result||result.success!==true) throw new Error('Not accepted');
      })(),
      new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Timeout'));},15000);})
    ]);
  } finally {clearTimeout(timer);}
}
function Contact() {
  const [status,setStatus] = React.useState('');
  const [error,setError] = React.useState('');
  const busy = React.useRef(false);
  async function submit(e) {
    e.preventDefault();
    if(busy.current) return;
    const form=e.currentTarget;
    if(!form.reportValidity()) return;
    busy.current=true; setError(''); setStatus('sending');
    try {
      const values=Object.fromEntries(new FormData(form));
      await sendWeb3Contact(values);
      setStatus('success'); form.reset();
    }catch{setStatus('');setError('Não foi possível enviar. Tente novamente.');}
    finally {busy.current=false;}
  }
  return <section className="contact-shell" id="contato"><div className="section wrap contact"><div><p className="kicker"><span>05 /</span> Vamos construir</p><h2>Seu próximo passo<br/>merece <em>boa tecnologia.</em></h2><p className="section-subhead">Conte o que sua empresa precisa resolver. Vamos encontrar um caminho para transformar esse desafio em uma solução.</p><a className="primary-button" href={whatsappHref()} target="_blank" rel="noopener noreferrer">Conversar no WhatsApp <Arrow/></a><a className="phone-link" href={whatsappHref()} target="_blank" rel="noopener noreferrer">{SITE.whatsapp.phoneDisplay}</a><p className="contact-note">Estratégia, desenvolvimento e evolução.<br/>Com atenção ao que faz diferença para você.</p></div><form className="contact-form" onSubmit={submit} aria-busy={status==='sending'} onChange={()=>{if(!busy.current){setStatus('');setError('');}}}><h3>Vamos falar sobre sua ideia?</h3><p>Envie sua solicitação diretamente para a Coderland.</p><div className="form-row"><label>Nome <span aria-hidden="true">*</span><input name="name" autoComplete="name" placeholder="Como podemos chamar você?" required maxLength="120"/></label><label>Empresa<input name="company" autoComplete="organization" placeholder="Nome da empresa" maxLength="160"/></label></div><div className="form-row"><label>E-mail <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" required maxLength="254" placeholder="voce@empresa.com"/></label><label>Telefone<input name="phone" type="tel" autoComplete="tel" maxLength="40" placeholder="Seu telefone (opcional)"/></label></div><label className="contact-trap" aria-hidden="true">Website<input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off"/></label><label>Interesse <span aria-hidden="true">*</span><select name="project" required defaultValue=""><option value="" disabled>Selecione uma solução</option>{SITE.projects.map(p=><option key={p.name}>{p.name}</option>)}<option>Auditoria</option><option>Projeto personalizado</option></select></label><label>Mensagem <span aria-hidden="true">*</span><textarea name="message" rows="4" placeholder="Qual desafio você quer resolver?" required maxLength="3000"/></label><button type="submit" className="primary-button" disabled={status==='sending'}>{status==='sending'?'Enviando mensagem...':'Enviar mensagem'} <Arrow/></button><div aria-live="polite" aria-atomic="true">{status==='success'&&<div className="form-success"><p>Mensagem enviada com sucesso!</p></div>}{error&&<p className="form-error" role="alert">{error}</p>}</div><small>Seus dados serão usados para responder à sua solicitação.</small></form></div></section>;
}
function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.3 7.3c-.5 0-1 1-1 1.7 0 2.6 3.5 6.2 6.4 6.7.9.2 2-.7 2-1.2 0-.3-2-1.3-2.2-1.2l-.9.8c-1.5-.6-2.5-1.6-3.2-3.1l.7-.8c.2-.3-.9-2.9-1.2-2.9Z"/></svg>;
}
function FooterOrbit() {
  return <div className="premium-footer__orbit" aria-hidden="true">
    <svg viewBox="0 0 680 450" fill="none" focusable="false"><defs><linearGradient id="footer-violet-orbit"><stop stopColor="#A875F1" stopOpacity="0"/><stop offset=".52" stopColor="#BE6CFF" stopOpacity="1"/><stop offset="1" stopColor="#A875F1" stopOpacity=".12"/></linearGradient><linearGradient id="footer-gold-orbit"><stop stopColor="#F3B334" stopOpacity=".07"/><stop offset=".55" stopColor="#F3B334" stopOpacity=".65"/><stop offset="1" stopColor="#F3B334" stopOpacity=".06"/></linearGradient><filter id="footer-orbit-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter><pattern id="footer-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#A875F1" opacity=".45"/></pattern></defs><rect x="450" y="80" width="160" height="285" fill="url(#footer-dot-grid)"/><path d="M740 -25C520 -10 365 60 295 175S235 380 420 448" stroke="url(#footer-gold-orbit)"/><path d="M-35 430C140 265 375 150 640 195c70 12 112 46 140 80" stroke="url(#footer-violet-orbit)" strokeWidth="5" opacity=".55" filter="url(#footer-orbit-glow)"/><path d="M-35 430C140 265 375 150 640 195c70 12 112 46 140 80" stroke="url(#footer-violet-orbit)" strokeWidth="1.4"/><path d="M310 420C145 365 200 155 395 103" stroke="#A875F1" strokeOpacity=".25"/><circle cx="370" cy="105" r="7" fill="#F3B334" opacity=".6" filter="url(#footer-orbit-glow)"/><circle cx="370" cy="105" r="4.5" fill="#F3B334"/><circle cx="185" cy="306" r="2" fill="#F3B334" opacity=".65"/></svg><div className="premium-footer__code">&lt;/&gt;</div>
  </div>;
}
function Footer() {
  return <footer className="premium-footer" id="rodape">
    <section className="premium-footer__invite" aria-labelledby="footer-invite-title"><div className="wrap premium-footer__invite-inner"><div className="premium-footer__copy"><p className="premium-footer__eyebrow"><span/>Vamos conversar?</p><h2 id="footer-invite-title">O próximo projeto de sucesso<br className="premium-footer__desktop-break"/> pode ser o <em>seu.</em></h2><p className="premium-footer__description">Conte sua ideia para a Coderland. Vamos encontrar a melhor solução tecnológica para o seu negócio.</p><a className="primary-button premium-footer__whatsapp" href={whatsappHref()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon/><span>Conversar no WhatsApp</span><Arrow/></a></div><FooterOrbit/></div></section>
    <div className="wrap premium-footer__columns">
      <div className="premium-footer__identity"><a className="brand" href={homeLink('inicio')} aria-label="Coderland — página inicial"><LogoMark/><span>Coderland<span className="brand-period">.</span></span></a><p>Tecnologia com propósito.<br/>Soluções para o mundo real.</p></div>
      <nav className="premium-footer__explore" aria-labelledby="footer-explore-title"><h3 id="footer-explore-title">Explorar</h3>{links.map(([id,label])=><a key={id} href={homeLink(id)}>{label}<span aria-hidden="true">›</span></a>)}</nav>
      <section className="premium-footer__contact" aria-labelledby="footer-contact-title"><h3 id="footer-contact-title">Contato</h3><a className="premium-footer__contact-card" href={whatsappHref()} target="_blank" rel="noopener noreferrer"><span className="premium-footer__contact-icon"><WhatsAppIcon/></span><span className="premium-footer__contact-copy"><strong>{SITE.whatsapp.phoneDisplay}</strong><span>Fale com a Coderland <span aria-hidden="true">→</span></span></span></a><p>Estamos prontos para entender o seu desafio<br className="premium-footer__desktop-break"/> e encontrar a melhor solução.</p></section>
    </div>
    <div className="wrap premium-footer__bottom"><p>© {new Date().getFullYear()} Coderland. Todos os direitos reservados.</p><a href="#inicio">Voltar ao topo <span aria-hidden="true">↑</span></a></div>
  </footer>;
}

const projectNeeds = ['Conectar sistemas e organizar rotinas operacionais que hoje exigem trabalho repetitivo.','Transformar necessidades comerciais e operacionais em aplicações, sites e ferramentas internas.','Apoiar atendimento, análise e produtividade com inteligência aplicada ao dia a dia.'];
function ProjectPage() {
  const index=projectSlugs.indexOf(window.__PROJECT_SLUG__); const p=SITE.projects[index];
  if (p.slug === 'fitland') return <FitlandPage project={p} index={index}/>;
  return <><section className="section wrap project-detail" id="inicio"><a className="text-link back-link" href="/#projetos">← Todos os projetos</a><div className="detail-hero"><div><p className="kicker">{p.eyebrow}</p><h1>{p.name}<span>.</span></h1><p className="section-subhead">{p.description}</p><a className="primary-button" href="#contato">Criar uma solução semelhante <Arrow/></a></div><ProjectVisual index={index}/></div></section><section className="section wrap detail-overview"><div><p className="kicker">O contexto</p><h2>Uma necessidade real.<br/><em>Um caminho digital.</em></h2><p>{projectNeeds[index]}</p></div><div><p className="kicker">A solução</p><h2>{p.name}</h2><p>{p.description}</p><ul>{p.items.map(item=><li key={item}><Icon kind={index}/><span>{item}</span></li>)}</ul></div></section><section className="wrap detail-note"><p>Sobre esta apresentação</p><span>A ilustração é conceitual e não representa uma tela do produto. Para conhecer o escopo e as possibilidades para sua empresa, converse com a Coderland.</span></section><Contact/></>;
}
function FitlandPage({project:p,index}) {
  return <>
    <section className="section wrap project-detail fitland-detail" id="inicio">
      <a className="text-link back-link" href="/#projetos">← Todos os projetos</a>
      <div className="detail-hero"><div><p className="kicker">{p.eyebrow}</p><h1>{p.name}<span>.</span></h1><p className="fitland-presentation">Tecnologia que transforma o acompanhamento de treinos.</p><p className="section-subhead">{p.description}</p><a className="primary-button" href="#contato">Criar uma solução semelhante <Arrow/></a><a className="text-link fitland-visit" href={p.url} target="_blank" rel="noopener noreferrer">Visitar Fitland <Arrow/></a></div><ProjectVisual index={index}/></div>
    </section>
    <section className="section wrap detail-overview"><div><p className="kicker">O desafio</p><h2>Mais organização.<br/><em>Mais proximidade.</em></h2><p>{p.need}</p></div><div><p className="kicker">A solução</p><h2>Uma rotina conectada.</h2><p>{p.solution}</p></div></section>
    <section className="section wrap fitland-features"><SectionHeading number="01" label="O aplicativo" title={<>Do planejamento<br/><em>ao acompanhamento.</em></>}/><div className="service-grid">{p.features.map((f,i)=><article className="service-card" key={f.title}><div className="card-top"><span className="service-icon"><Icon kind={i}/></span><span className="card-index">0{i+1}</span></div><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></section>
    <section className="section wrap fitland-gallery"><div><p className="kicker">02 / Dentro do Fitland</p><h2>Uma janela<br/><em>para a plataforma.</em></h2><p className="section-subhead">Recorte real do painel de atividade na versão mobile. O estado sem dados faz parte da aplicação; a captura não contém informações pessoais.</p><a className="text-link" href={p.url} target="_blank" rel="noopener noreferrer">Conhecer a aplicação <Arrow/></a></div><figure><a href={p.capture.src} target="_blank" rel="noopener noreferrer" aria-label="Ampliar captura real do painel do Fitland"><img src={p.capture.src} width={p.capture.width} height={p.capture.height} alt={p.capture.alt} loading="lazy" decoding="async"/></a><figcaption>Captura real · painel de atividade · versão mobile</figcaption></figure></section>
    <section className="wrap fitland-tech"><p className="kicker">03 / Tecnologias do projeto</p><ul>{p.technologies.map(t=><li key={t}>{t}</li>)}</ul></section>
    <section className="wrap detail-note"><p>Sobre esta apresentação</p><span>O smartphone é um mockup ilustrativo com um recorte real do Fitland. As funcionalidades apresentadas foram identificadas na aplicação e no código do projeto. O acesso a cada área depende do perfil e dos módulos habilitados.</span></section>
    <Contact/>
  </>;
}

function App() {
  React.useLayoutEffect(()=>{
    // React renders the anchor after the browser's initial fragment lookup.
    if(!window.location.hash)return;
    let id;try{id=decodeURIComponent(window.location.hash.slice(1));}catch{return;}
    document.getElementById(id)?.scrollIntoView({behavior:'instant'});
  },[]);
  React.useEffect(()=>{
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.service-card,.project-card,.process-timeline li,.audit-dossier').forEach(el=>{el.classList.add('reveal');observer.observe(el);});
    return ()=>observer.disconnect();
  },[]);
  return <><a className="skip-link" href="#main-content">Pular para o conteúdo</a><Header/><main id="main-content" tabIndex="-1">{isProject?<ProjectPage/>:<><Hero/><Services/><Audit/><Projects/><Process/><Contact/></>}</main><Footer/><SiteChat/></>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
