import { useState, useEffect } from "react";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [profiles] = useState([
    {
      name: "Ana Souza",
      age: 28,
      bio: "Escritora apaixonada por poesia e ativismo cultural.",
      img: "https://source.unsplash.com/200x200/?woman,portrait"
    },
    {
      name: "Luiza Martins",
      age: 35,
      bio: "Cineasta independente e amante da literatura lésbica.",
      img: "https://source.unsplash.com/200x200/?lesbian,smile"
    },
    {
      name: "Camila Rocha",
      age: 31,
      bio: "Organizadora de eventos comunitários e rodas de conversa.",
      img: "https://source.unsplash.com/200x200/?woman,smiling"
    }
  ]);

  const handleSend = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, likes: 0 }]);
      setInput("");
    }
  };

  const handleLike = (index) => {
    const updated = [...messages];
    updated[index].likes += 1;
    setMessages(updated);
  };

  const quiz = [
    {
      question: "O que mais te inspira na comunidade lésbica?",
      options: ["Amor", "Arte", "Resistência", "Amizade"]
    },
    {
      question: "Qual símbolo representa melhor você?",
      options: ["🌈", "🌻", "🔥", "🌙"]
    },
    {
      question: "O que você gostaria de ver mais neste espaço?",
      options: ["Histórias", "Eventos", "Apoio", "Arte"]
    }
  ];

  const handleAnswer = (option) => {
    setAnswers([...answers, option]);
    setQuizStep(quizStep + 1);
  };

  // Simulação de registro de Service Worker para PWA com suporte offline
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("Service Worker registrado para PWA ✅"))
        .catch((err) => console.error("Erro no Service Worker:", err));
    }

    // Simulação de solicitação de permissão para notificações
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (msg) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🌈 Nova atividade no mural!", {
        body: msg,
        icon: "https://source.unsplash.com/100x100/?pride"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white text-gray-800">
      {/* Header */}
      <header className="p-6 flex justify-between items-center shadow-md bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-pink-600">Feito Pensando nas Lésbicas</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#comunidade" className="hover:text-pink-600">Comunidade</a>
          <a href="#historias" className="hover:text-pink-600">Histórias</a>
          <a href="#arte" className="hover:text-pink-600">Arte & Cultura</a>
          <a href="#recursos" className="hover:text-pink-600">Recursos</a>
          <a href="#mural" className="hover:text-pink-600">Mural</a>
          <a href="#quiz" className="hover:text-pink-600">Quiz</a>
          <a href="#perfis" className="hover:text-pink-600">Perfis</a>
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-pink-600 focus:outline-none">
          ☰
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md flex flex-col items-center py-4 space-y-4">
          <a href="#comunidade" className="hover:text-pink-600">Comunidade</a>
          <a href="#historias" className="hover:text-pink-600">Histórias</a>
          <a href="#arte" className="hover:text-pink-600">Arte & Cultura</a>
          <a href="#recursos" className="hover:text-pink-600">Recursos</a>
          <a href="#mural" className="hover:text-pink-600">Mural</a>
          <a href="#quiz" className="hover:text-pink-600">Quiz</a>
          <a href="#perfis" className="hover:text-pink-600">Perfis</a>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-purple-700 animate-fade-in">
          Um espaço criado com amor e orgulho
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 animate-fade-in-delay">
          Celebrando as vozes, histórias e culturas lésbicas. Aqui você encontra acolhimento,
          inspiração e força para ser quem você é.
        </p>
        <button className="mt-8 px-6 py-3 bg-pink-600 text-white rounded-2xl shadow-lg hover:bg-pink-700 transition animate-bounce">
          Instale o App 🌈
        </button>
      </section>

      {/* Mural de Mensagens */}
      <section id="mural" className="py-16 px-6 bg-white">
        <h3 className="text-3xl font-bold text-center text-pink-600 mb-6">Mural da Comunidade</h3>
        <div className="max-w-3xl mx-auto">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deixe sua mensagem..."
              className="flex-1 px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={() => {
                handleSend();
                sendNotification("Uma nova mensagem foi postada no mural!");
              }}
              className="px-4 py-2 bg-pink-600 text-white rounded-2xl hover:bg-pink-700 transition"
            >
              Enviar
            </button>
          </div>
          <div className="space-y-3">
            {messages.length === 0 && <p className="text-gray-500 italic">Nenhuma mensagem ainda. Seja a primeira! 🌈</p>}
            {messages.map((msg, idx) => (
              <div key={idx} className="p-3 bg-pink-50 rounded-xl shadow-sm flex justify-between items-center">
                <span>{msg.text}</span>
                <button onClick={() => handleLike(idx)} className="text-sm text-pink-600 hover:underline">
                  ❤️ {msg.likes}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz e Perfis continuam iguais (omitidos aqui para foco na novidade) */}

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 bg-white border-t mt-10">
        <p>Feito com 🌈 e 💜 para todas as lésbicas • © 2025</p>
        <p className="text-sm mt-2">Este app funciona offline e envia notificações ✨</p>
      </footer>
    </div>
  );
}
