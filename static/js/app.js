// JSX entrypoint (loaded via Babel in-browser)
const DEFAULT_SITE = {
  brand: "Coderland",
  whatsapp: { phoneDisplay: "(48) 98800-6788", waMe: "https://wa.me/5548988006788" },
  hero: {
    pill: "Soluções tecnológicas e auditorias para empresas",
    headline: "Coderland cria soluções tecnológicas e auditorias para empresas.",
    subhead:
      "Desenvolvemos aplicações, sites, integrações e automações, além de mapear processos para encontrar gargalos, riscos e oportunidades de evolução digital.",
  },
  services: [],
  projects: [],
};

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
  return (
    <div className="logo-mark" aria-label="Símbolo da Coderland" role="img">
      <span className="logo-code">&lt;/&gt;</span>
      <span className="orbit orbit-one"></span>
      <span className="orbit orbit-two"></span>
      <i className="dot dot-a"></i>
      <i className="dot dot-b"></i>
      <i className="dot dot-c"></i>
      <i className="dot dot-d"></i>
      <i className="dot dot-e"></i>
      <i className="dot dot-f"></i>
    </div>
  );
}

function Header() {
  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;
  const whatsappLink = data.whatsapp?.waMe || DEFAULT_SITE.whatsapp.waMe;
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Coderland">
        <LogoMark />
        <span>{data.brand || "Coderland"}</span>
      </a>
      <nav aria-label="Navegação principal">
        <a href="#solucoes">Soluções</a>
        <a href="#solucoes">Auditorias</a>
        <a href="#projetos">Projetos</a>
        <a href="#metodo">Método</a>
        <a href="#contato">Contato</a>
      </nav>
      <a className="header-action" href={whatsappLink} target="_blank" rel="noreferrer">
        Falar agora
      </a>
    </header>
  );
}

function Hero() {
  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;
  return (
    <section className="hero" id="inicio">
      <div className="hero-shape shape-one"></div>
      <div className="hero-shape shape-two"></div>
      <div className="hero-shape shape-three"></div>
      <div className="hero-copy">
        <p className="hero-pill">{data.hero?.pill}</p>
        <h1>{data.hero?.headline}</h1>
        <p>{data.hero?.subhead}</p>
        <div className="hero-actions">
          <a className="secondary-button" href="#projetos">Ver projetos</a>
        </div>
      </div>
      <div className="hero-metrics" aria-label="Resumo das soluções Coderland">
        <div>
          <strong>Auditoria</strong>
          <span>processos, riscos e oportunidades</span>
        </div>
        <div>
          <strong>Automação</strong>
          <span>rotinas, APIs e integrações</span>
        </div>
        <div>
          <strong>Produtos web</strong>
          <span>sites, sistemas e dashboards</span>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;
  return (
    <section className="section" id="solucoes">
      <div className="section-heading">
        <p className="kicker">O que vendemos</p>
        <h2>Soluções tecnológicas e auditorias para empresas que precisam organizar, automatizar e crescer.</h2>
      </div>
      <div className="service-grid">
        {(data.services || []).map((service) => (
          <div className="service-card" key={service}>
            <span aria-hidden="true">+</span>
            <p>{service}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;
  return (
    <section className="section projects-section" id="projetos">
      <div className="section-heading">
        <p className="kicker">Projetos principais</p>
        <h2>Três frentes para vender, organizar e automatizar melhor.</h2>
      </div>
      <div className="project-grid">
        {(data.projects || []).map((project) => (
          <article className={`project-card ${project.accent}`} key={project.name}>
            <div>
              <p>{project.eyebrow}</p>
              <h3>{project.name}</h3>
              <span>{project.description}</span>
            </div>
            <ul>
              {project.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="process-band" id="metodo">
      <div>
        <p className="kicker">Método Coderland</p>
        <h2>Diagnóstico, construção e evolução contínua.</h2>
      </div>
      <ol>
        <li>
          <strong>Mapeamos</strong>
          <span>entendemos vendas, atendimento, gestão e operação.</span>
        </li>
        <li>
          <strong>Construímos</strong>
          <span>criamos a solução com backend, frontend e integrações.</span>
        </li>
        <li>
          <strong>Evoluímos</strong>
          <span>medimos, ajustamos e ampliamos conforme o uso real.</span>
        </li>
      </ol>
    </section>
  );
}

function Contact() {
  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;
  const whatsappLink = data.whatsapp?.waMe || DEFAULT_SITE.whatsapp.waMe;
  const whatsappPhone = data.whatsapp?.phoneDisplay || DEFAULT_SITE.whatsapp.phoneDisplay;
  const [sent, setSent] = React.useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="contact" id="contato">
      <div>
        <p className="kicker">Vamos construir</p>
        <h2>Conte qual processo você quer organizar primeiro.</h2>
        <p>
          A Coderland pode criar o site, sistema, automação ou integração que sua empresa precisa para ganhar ritmo.
        </p>
        <a className="whatsapp-link" href={whatsappLink} target="_blank" rel="noreferrer">
          Chamar no WhatsApp: {whatsappPhone}
        </a>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input type="text" name="name" placeholder="Seu nome" />
        </label>
        <label>
          Empresa
          <input type="text" name="company" placeholder="Nome da empresa" />
        </label>
        <label>
          Projeto
          <select name="project" defaultValue="">
            <option value="" disabled>Escolha uma solução</option>
            <option>Fluxonland</option>
            <option>Hey Dev</option>
            <option>Lua Active</option>
            <option>Projeto personalizado</option>
          </select>
        </label>
        <label>
          Mensagem
          <textarea name="message" rows="4" placeholder="Descreva o que precisa automatizar ou vender melhor"></textarea>
        </label>
        <button type="submit">Enviar interesse</button>
        {sent && (
          <p className="form-success">
            Interesse registrado. A próxima etapa é conectar este formulário ao WhatsApp, e-mail ou CRM da Coderland.
          </p>
        )}
      </form>
    </section>
  );
}

function SiteChat() {
  const data = window.__CODERLAND_SITE__ || DEFAULT_SITE;
  const whatsappLink = data.whatsapp?.waMe || DEFAULT_SITE.whatsapp.waMe;
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([
    {
      from: "bot",
      text: "Olá, sou o assistente da Coderland. Posso responder sobre soluções, auditorias, automações, sites e projetos.",
    },
  ]);

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
        <section className="chat-panel" aria-label="Chat Coderland">
          <header>
            <div>
              <strong>Chat Coderland</strong>
              <span>Responde usando o conteúdo do site</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Fechar chat">
              ×
            </button>
          </header>
          <div className="chat-messages">
            {messages.map((chatMessage, index) => (
              <div className={`chat-message ${chatMessage.from}`} key={`${chatMessage.from}-${index}`}>
                <p>{chatMessage.text}</p>
                {chatMessage.fallback && (
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    Entrar em contato pelo WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Digite sua dúvida"
              aria-label="Digite sua dúvida"
            />
            <button type="submit">Enviar</button>
          </form>
        </section>
      )}
      <button className="chat-toggle" type="button" onClick={() => setIsOpen((current) => !current)}>
        {isOpen ? "Fechar" : "Chat"}
      </button>
    </div>
  );
}

function App() {
  const [site, setSite] = React.useState(DEFAULT_SITE);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/site")
      .then((res) => (res.ok ? res.json() : DEFAULT_SITE))
      .then((data) => {
        if (cancelled) return;
        window.__CODERLAND_SITE__ = data;
        setSite(data);
      })
      .catch(() => {
        window.__CODERLAND_SITE__ = DEFAULT_SITE;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Projects />
        <Process />
        <Contact />
      </main>
      <footer>
        <span>{site.brand || "Coderland"}</span>
        <p>Aplicações e sites que organizam o trabalho real.</p>
      </footer>
      <SiteChat />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
