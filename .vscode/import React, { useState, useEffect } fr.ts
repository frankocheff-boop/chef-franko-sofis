 import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Utensils, CalendarCheck, Phone, Info, Home as HomeIcon, Loader2, Send, Lightbulb, MessageSquare } from 'lucide-react'; // Removed ChefHat as it's replaced by logo

// Global variables provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? initialAuthToken : null;

// Formspree URL for Contact Form submission
const FORMSPREE_CONTACT_URL = "https://formspree.io/f/mvgqblyn";

const App = () => {
  // Firebase states
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [reservationForm, setReservationForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    eventType: '',
    dietary: '',
    specialRequests: '',
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  // LLM states
  const [menuSuggestionInput, setMenuSuggestionInput] = useState({
    cuisine: '',
    dietary: '',
    occasion: '',
    courses: '',
  });
  const [generatedMenu, setGeneratedMenu] = useState('');
  const [isGeneratingMenu, setIsGeneratingMenu] = useState(false);

  const [clientInquiry, setClientInquiry] = useState('');
  const [draftedResponse, setDraftedResponse] = useState('');
  const [isDraftingResponse, setIsDraftingResponse] = useState(false);

  // Active section for navigation
  const [activeSection, setActiveSection] = useState('home'); // 'home', 'about', 'services', 'reserve', 'contact'

  // Initialize Firebase
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const authentication = getAuth(app);

    setDb(firestore);
    setAuth(authentication);

    const unsubscribe = onAuthStateChanged(authentication, async (user) => {
      if (user) {
        setUserId(user.uid);
        setAuthReady(true);
        setLoading(false);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(authentication, initialAuthToken);
          } else {
            await signInAnonymously(authentication);
          }
        } catch (error) {
          console.error("Firebase authentication error:", error);
          setMessage({ type: 'error', text: 'Authentication failed. Please try again.' });
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle form input changes
  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMenuSuggestionInputChange = (e) => {
    const { name, value } = e.target;
    setMenuSuggestionInput(prev => ({ ...prev, [name]: value }));
  };

  // Submit Reservation Form (Kept on Firestore for data management)
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (!db || !authReady) {
      setMessage({ type: 'error', text: 'Application not ready. Please wait.' });
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/chefReservations`), {
        ...reservationForm,
        timestamp: serverTimestamp(),
        submittedBy: userId,
      });
      setMessage({ type: 'success', text: 'Reservation submitted successfully! We will contact you soon.' });
      setReservationForm({ name: '', email: '', phone: '', date: '', time: '', guests: '', eventType: '', dietary: '', specialRequests: '' });
    } catch (error) {
      console.error("Error submitting reservation:", error);
      setMessage({ type: 'error', text: 'Error submitting reservation. Please try again.' });
    }
  };

  // Submit Contact Form (Updated to use Formspree)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!authReady) {
      setMessage({ type: 'error', text: 'Application not ready. Please wait.' });
      return;
    }

    try {
      // Submit data to Formspree
      const formspreeResponse = await fetch(FORMSPREE_CONTACT_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            name: contactForm.name,
            email: contactForm.email,
            message: contactForm.message,
            _replyto: contactForm.email // Formspree field for reply email
        })
      });

      if (formspreeResponse.ok) {
        setMessage({ type: 'success', text: 'Message sent successfully! Your message has been forwarded to the chef.' });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        // Log Formspree specific errors
        let errorData;
        try {
            errorData = await formspreeResponse.json();
        } catch {
            errorData = { error: 'Unknown Formspree error.' };
        }
        console.error("Formspree error:", errorData);
        setMessage({ type: 'error', text: 'Error sending message via Formspree. Please check your form endpoint or the network connection.' });
      }
    } catch (error) {
      console.error("Error sending message (network or system):", error);
      setMessage({ type: 'error', text: 'Error sending message. Please try again.' });
    }
  };

  // LLM: Generate Personalized Menu Suggestion
  const generateMenuSuggestion = async () => {
    setIsGeneratingMenu(true);
    setGeneratedMenu('');
    setMessage({ type: '', text: '' });

    const prompt = `Generate a personalized multi-course menu suggestion (Appetizer, Main Course, Dessert) for a private dining event based on the following preferences:
    Cuisine Preference: ${menuSuggestionInput.cuisine || 'Any'}
    Dietary Needs: ${menuSuggestionInput.dietary || 'None'}
    Occasion: ${menuSuggestionInput.occasion || 'General'}
    Number of Courses: ${menuSuggestionInput.courses || '3'}

    Provide a creative and enticing menu. Format it clearly with course titles and brief descriptions.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedMenu(text);
        setMessage({ type: 'success', text: 'Menu suggestion generated!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to generate menu. No content received.' });
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      console.error("Error calling Gemini API for menu suggestion:", error);
      setMessage({ type: 'error', text: 'Error generating menu. Please check console.' });
    } finally {
      setIsGeneratingMenu(false);
    }
  };

  // LLM: Draft Response to Client Inquiry
  const draftClientResponse = async () => {
    setIsDraftingResponse(true);
    setDraftedResponse('');
    setMessage({ type: '', text: '' });

    const prompt = `Draft a polite and professional response from a chef to a client's inquiry.
    Client Inquiry: "${clientInquiry}"

    The response should:
    1. Acknowledge the inquiry.
    2. Offer to provide more details or schedule a call.
    3. Maintain a friendly and professional tone.
    4. End with a professional closing from the chef.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setDraftedResponse(text);
        setMessage({ type: 'success', text: 'Response drafted successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to draft response. No content received.' });
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      console.error("Error calling Gemini API for response draft:", error);
      setMessage({ type: 'error', text: 'Error drafting response. Please check console.' });
    } finally {
      setIsDraftingResponse(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 font-inter text-gray-800">
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-xl">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
          <p className="text-xl font-semibold text-blue-700">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 font-inter text-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo added here */}
            <img
              src="https://httpsimgur.comauCqo8Lp (2).png."
              alt="Chef Franko Private Chef Logo"
              className="w-16 h-16 object-contain mr-3" // Adjust size as needed
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/FF5733/FFFFFF?text=Logo"; }}
            />
            <span className="text-3xl font-bold text-gray-900">Chef Franko</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <button onClick={() => setActiveSection('home')} className={`text-lg font-medium ${activeSection === 'home' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
              Inicio
            </button>
            <button onClick={() => setActiveSection('about')} className={`text-lg font-medium ${activeSection === 'about' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
              Sobre Mí
            </button>
            <button onClick={() => setActiveSection('services')} className={`text-lg font-medium ${activeSection === 'services' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
              Servicios
            </button>
            <button onClick={() => setActiveSection('reserve')} className={`text-lg font-medium ${activeSection === 'reserve' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
              Reservar
            </button>
            <button onClick={() => setActiveSection('contact')} className={`text-lg font-medium ${activeSection === 'contact' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}>
              Contacto
            </button>
          </div>
          {/* Mobile menu button (optional, for full responsiveness) */}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <p className="font-medium text-center">{message.text}</p>
          </div>
        )}

        {/* Home Section */}
        {activeSection === 'home' && (
          <section id="home" className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
            <HomeIcon className="text-red-600 mx-auto mb-6" size={64} />
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Bienvenido a mi Mundo Culinario</h2>
            <p className="text-xl text-gray-700 mb-8">
              Donde la pasión por la cocina se encuentra con el arte del sabor. Permítame transformar sus eventos en experiencias gastronómicas inolvidables.
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setActiveSection('reserve')} className="px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-105">
                Reservar Ahora
              </button>
              <button onClick={() => setActiveSection('services')} className="px-8 py-4 bg-gray-200 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-300 transition duration-300 transform hover:scale-105">
                Ver Servicios
              </button>
            </div>
            <div className="mt-10">
              {/* Image updated to use the Imgur link provided by the user */}
              <img 
                src="https://imgur.com/a/geEqqjR" 
                alt="Plato de Autor del Chef Franko" 
                className="rounded-lg shadow-md w-full h-auto object-cover" 
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1200x400/FF5733/FFFFFF?text=Plato+de+Autor"; }} 
              />
            </div>
          </section>
        )}

        {/* About Me Section */}
        {activeSection === 'about' && (
          <section id="about" className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <Info className="text-red-600 mb-6" size={48} />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Sobre Mí: Mi Pasión por la Cocina</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                {/* Retrato del chef */}
                <img 
                  src="https://content-fetcher-url/uploaded:unnamed (1).jpg" 
                  alt="Retrato del Chef Franko" 
                  className="rounded-lg shadow-md w-full h-auto object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/3366FF/FFFFFF?text=Retrato+Chef"; }} 
                />
              </div>
              <div className="text-lg text-gray-700 space-y-4">
                <p>
                  Mi nombre es Franko, y mi viaje culinario comenzó hace [Número] años, impulsado por una profunda curiosidad y un amor inquebrantable por los sabores. Desde temprana edad, la cocina fue mi laboratorio, un lugar donde la creatividad y la técnica se fusionaban para deleitar los sentidos.
                </p>
                <p>
                  He tenido el privilegio de formarme en [Menciona escuelas/instituciones o chefs/restaurantes destacados] y de trabajar en [Menciona tipos de establecimientos o experiencias], lo que me ha permitido dominar diversas técnicas y explorar una amplia gama de cocinas, desde la tradicional [Cocina 1] hasta la innovadora [Cocina 2].
                </p>
                <p>
                  Mi filosofía se centra en el uso de ingredientes frescos, de temporada y de origen local, transformándolos en platos que no solo nutren el cuerpo, sino que también cuentan una historia y evocan emociones. Cada plato que creo es una expresión de mi respeto por el producto y mi deseo de ofrecer una experiencia memorable.
                </p>
                <p>
                  Estoy aquí para llevar mi pasión directamente a su mesa, creando momentos culinarios únicos y personalizados para usted y sus invitados.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {activeSection === 'services' && (
          <section id="services" className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <Utensils className="text-red-600 mb-6" size={48} />
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Mis Servicios Culinarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Service Card 1 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <img src="https://placehold.co/400x250/FF8C00/FFFFFF?text=Cenas+Privadas" alt="Cenas+Privadas" className="rounded-md mb-4 w-full h-auto object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/FF8C00/FFFFFF?text=Cenas+Privadas"; }} />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Cenas Privadas Exclusivas</h3>
                <p className="text-gray-700">
                  Transformo su hogar o villa en un restaurante de alta cocina. Diseñamos un menú personalizado, me encargo de la compra, preparación, servicio y limpieza, para que usted solo se preocupe de disfrutar.
                </p>
              </div>
              {/* Service Card 2 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <img src="https://placehold.co/400x250/008080/FFFFFF?text=Catering+Eventos" alt="Catering para Eventos" className="rounded-md mb-4 w-full h-auto object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/008080/FFFFFF?text=Catering+Eventos"; }} />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Catering para Eventos Especiales</h3>
                <p className="text-gray-700">
                  Desde pequeñas reuniones hasta grandes celebraciones, ofrezco soluciones de catering adaptadas a sus necesidades. Menús temáticos, estaciones de comida, y un servicio impecable para cualquier ocasión.
                </p>
              </div>
              {/* Service Card 3 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <img src="https://placehold.co/400x250/800080/FFFFFF?text=Clases+Cocina" alt="Clases de Cocina" className="rounded-md mb-4 w-full h-auto object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/800080/FFFFFF?text=Clases+Cocina"; }} />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Clases de Cocina Personalizadas</h3>
                <p className="text-gray-700">
                  Aprenda los secretos de la cocina en sesiones interactivas. Clases individuales o grupales, enfocadas en técnicas específicas, cocinas del mundo o platos de su elección. ¡Diversión y aprendizaje garantizados!
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Reservation Section */}
        {activeSection === 'reserve' && (
          <section id="reserve" className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <CalendarCheck className="text-red-600 mb-6" size={48} />
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Reserva tu Experiencia Culinaria</h2>
            <form onSubmit={handleReservationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" id="name" name="name" value={reservationForm.name} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" id="email" name="email" value={reservationForm.email} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Número de Teléfono</label>
                <input type="tel" id="phone" name="phone" value={reservationForm.phone} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha Preferida</label>
                <input type="date" id="date" name="date" value={reservationForm.date} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Hora Preferida</label>
                <input type="time" id="time" name="time" value={reservationForm.time} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
              </div>
              <div>
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">Número de Invitados</label>
                <input type="number" id="guests" name="guests" value={reservationForm.guests} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" min="1" required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
                <select id="eventType" name="eventType" value={reservationForm.eventType} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required>
                  <option value="">Selecciona un tipo de evento</option>
                  <option value="Cena Privada">Cena Privada</option>
                  <option value="Catering">Catering para Evento</option>
                  <option value="Clase de Cocina">Clase de Cocina</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">Restricciones Dietéticas / Alergias (si aplica)</label>
                <textarea id="dietary" name="dietary" rows="3" value={reservationForm.dietary} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"></textarea>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">Solicitudes Especiales</label>
                <textarea id="specialRequests" name="specialRequests" rows="3" value={reservationForm.specialRequests} onChange={handleReservationChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"></textarea>
              </div>
              <div className="md:col-span-2 text-center">
                <button type="submit" className="px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center justify-center mx-auto">
                  <CalendarCheck className="mr-3" size={24} /> Enviar Solicitud de Reserva
                </button>
              </div>
            </form>

            <h3 className="text-3xl font-bold text-gray-900 mt-12 mb-6 text-center">Herramientas de IA para Menú</h3>
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
              <p className="text-gray-700 mb-4">Genera ideas de menú personalizadas para tus eventos.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">Preferencia de Cocina</label>
                  <input type="text" id="cuisine" name="cuisine" value={menuSuggestionInput.cuisine} onChange={handleMenuSuggestionInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Italiana, Mexicana, Fusión" />
                </div>
                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">Necesidades Dietéticas</label>
                  <input type="text" id="dietary" name="dietary" value={menuSuggestionInput.dietary} onChange={handleMenuSuggestionInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Vegetariano, Sin Gluten, Alergia a nueces" />
                </div>
                <div>
                  <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-1">Ocasión</label>
                  <input type="text" id="occasion" name="occasion" value={menuSuggestionInput.occasion} onChange={handleMenuSuggestionInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Aniversario, Cena familiar, Evento corporativo" />
                </div>
                <div>
                  <label htmlFor="courses" className="block text-sm font-medium text-gray-700 mb-1">Número de Platos</label>
                  <input type="number" id="courses" name="courses" value={menuSuggestionInput.courses} onChange={handleMenuSuggestionInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" min="1" placeholder="Ej: 3, 5" />
                </div>
              </div>
              <button
                type="button"
                onClick={generateMenuSuggestion}
                disabled={isGeneratingMenu}
                className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingMenu ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} /> Generando Menú...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2" size={20} /> Generar Sugerencia de Menú
                  </>
                )}
              </button>
              {generatedMenu && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-2">Menú Sugerido:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{generatedMenu}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Contact Section */}
        {activeSection === 'contact' && (
          <section id="contact" className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <Phone className="text-red-600 mb-6" size={48} />
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Contáctame</h2>
            <p className="text-lg text-gray-700 mb-8 text-center">
              ¿Tienes alguna pregunta, una idea para un evento especial o simplemente quieres saludar? ¡No dudes en contactarme!
            </p>
            {/* The form uses the handleContactSubmit function to post to Formspree */}
            <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
                <input type="text" id="contactName" name="name" value={contactForm.name} onChange={handleContactChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Tu Correo Electrónico</label>
                <input type="email" id="contactEmail" name="email" value={contactForm.email} onChange={handleContactChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="contactMessage" className="block text-sm font-medium text-gray-700 mb-1">Tu Mensaje</label>
                <textarea id="contactMessage" name="message" rows="5" value={contactForm.message} onChange={handleContactChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required></textarea>
              </div>
              <div className="md:col-span-2 text-center">
                <button type="submit" className="px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center justify-center mx-auto">
                  <Send className="mr-3" size={24} /> Enviar Mensaje
                </button>
              </div>
            </form>

            <h3 className="text-3xl font-bold text-gray-900 mt-12 mb-6 text-center">Herramienta de IA para Respuestas</h3>
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
              <p className="text-gray-700 mb-4">Ingresa una consulta de un cliente para generar un borrador de respuesta.</p>
              <div className="mb-4">
                <label htmlFor="clientInquiry" className="block text-sm font-medium text-gray-700 mb-1">Consulta del Cliente</label>
                <textarea id="clientInquiry" value={clientInquiry} onChange={(e) => setClientInquiry(e.target.value)} rows="4" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: 'Hola Chef, estoy interesado en una clase de cocina para 10 personas. ¿Qué opciones tienen?'"></textarea>
              </div>
              <button
                type="button"
                onClick={draftClientResponse}
                disabled={isDraftingResponse || !clientInquiry.trim()}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDraftingResponse ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} /> Redactando Respuesta...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2" size={20} /> Redactar Respuesta
                  </>
                )}
              </button>
              {draftedResponse && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-2">Borrador de Respuesta:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{draftedResponse}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; 2025 Chef Franko. Todos los derechos reservados.</p>
          <p>Diseñado con pasión culinaria.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;