import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbKPAMVQtAO31KdSM_CyoLnv03KxtNyR0",
  authDomain: "final-web-project-2917f.firebaseapp.com",
  projectId: "final-web-project-2917f",
  storageBucket: "final-web-project-2917f.firebasestorage.app",
  messagingSenderId: "997292507536",
  appId: "1:997292507536:web:1010e6d5ed674091947315",
  measurementId: "G-KC1SK87B7R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function App() {
  const [usuario, setUsuario] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [vistaActual, setVistaActual] = useState('publicaciones');
  const [cargando, setCargando] = useState(true);

  // Estados para formularios
  const [formLogin, setFormLogin] = useState({ email: '', password: '' });
  const [formRegistro, setFormRegistro] = useState({
    nombre: '',
    apellido: '', 
    nombre_usuario: '',
    email: '',
    password: ''
  });
  const [formPublicacion, setFormPublicacion] = useState({ contenido: '' });

  useEffect(() => {
    // Escuchar cambios en autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });

    // Cargar publicaciones
    cargarPublicaciones();

    return () => unsubscribe();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      const q = query(collection(db, 'publicaciones'), orderBy('fechaPublicacion', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setPublicaciones(posts);
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    }
  };

  const registrarUsuario = async () => {
    if (!formRegistro.nombre || !formRegistro.apellido || !formRegistro.nombre_usuario || 
        !formRegistro.email || !formRegistro.password) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formRegistro.email, 
        formRegistro.password
      );
      
      // Guardar datos adicionales en Firestore
      await addDoc(collection(db, 'usuarios'), {
        nombre: formRegistro.nombre,
        apellido: formRegistro.apellido,
        nombre_usuario: formRegistro.nombre_usuario,
        password_usuario: formRegistro.password,
        uid: userCredential.user.uid
      });

      alert('Usuario registrado exitosamente');
      setVistaActual('publicaciones');
      setFormRegistro({ nombre: '', apellido: '', nombre_usuario: '', email: '', password: '' });
    } catch (error) {
      alert('Error al registrar: ' + error.message);
    }
  };

  const iniciarSesion = async () => {
    if (!formLogin.email || !formLogin.password) {
      alert('Correo y contraseña son obligatorios');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formLogin.email, formLogin.password);
      alert('Sesión iniciada correctamente');
      setVistaActual('publicaciones');
      setFormLogin({ email: '', password: '' });
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      alert('Sesión cerrada');
    } catch (error) {
      alert('Error al cerrar sesión');
    }
  };

  const crearPublicacion = async () => {
    if (!usuario || !formPublicacion.contenido.trim()) {
      alert('Debes escribir contenido para la publicación');
      return;
    }

    try {
      await addDoc(collection(db, 'publicaciones'), {
        autorId: usuario.uid,
        autorNombre: usuario.email.split('@')[0],
        contenido: formPublicacion.contenido,
        fechaPublicacion: new Date()
      });

      setFormPublicacion({ contenido: '' });
      cargarPublicaciones();
      alert('Publicación creada exitosamente');
    } catch (error) {
      alert('Error al crear publicación: ' + error.message);
    }
  };

  if (cargando) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>Red Social</h1>
        <nav style={styles.nav}>
          <button 
            style={{...styles.navButton, backgroundColor: vistaActual === 'publicaciones' ? '#1e3a8a' : 'transparent'}}
            onClick={() => setVistaActual('publicaciones')}
          >
            Publicaciones
          </button>
          
          {usuario ? (
            <>
              <button 
                style={{...styles.navButton, backgroundColor: vistaActual === 'crear' ? '#1e3a8a' : 'transparent'}}
                onClick={() => setVistaActual('crear')}
              >
                Crear Post
              </button>
              <button style={styles.logoutButton} onClick={cerrarSesion}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button 
                style={{...styles.navButton, backgroundColor: vistaActual === 'login' ? '#1e3a8a' : 'transparent'}}
                onClick={() => setVistaActual('login')}
              >
                Iniciar Sesión
              </button>
              <button 
                style={{...styles.navButton, backgroundColor: vistaActual === 'registro' ? '#1e3a8a' : 'transparent'}}
                onClick={() => setVistaActual('registro')}
              >
                Registrarse
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Contenido principal */}
      <main style={styles.main}>
        {vistaActual === 'publicaciones' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Todas las Publicaciones</h2>
            {publicaciones.length === 0 ? (
              <p style={styles.noData}>No hay publicaciones aún</p>
            ) : (
              publicaciones.map((post) => (
                <div key={post.id} style={styles.postCard}>
                  <div style={styles.postHeader}>
                    <strong style={styles.autorNombre}>{post.autorNombre}</strong>
                    <span style={styles.fecha}>
                      {post.fechaPublicacion?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                    </span>
                  </div>
                  <p style={styles.postContent}>{post.contenido}</p>
                </div>
              ))
            )}
          </div>
        )}

        {vistaActual === 'login' && !usuario && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Iniciar Sesión</h2>
            <div style={styles.form}>
              <input
                style={styles.input}
                type="email"
                placeholder="Correo electrónico"
                value={formLogin.email}
                onChange={(e) => setFormLogin({...formLogin, email: e.target.value})}
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Contraseña"
                value={formLogin.password}
                onChange={(e) => setFormLogin({...formLogin, password: e.target.value})}
              />
              <button onClick={iniciarSesion} style={styles.submitButton}>Iniciar Sesión</button>
            </div>
          </div>
        )}

        {vistaActual === 'registro' && !usuario && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Crear Cuenta</h2>
            <div style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Nombre"
                value={formRegistro.nombre}
                onChange={(e) => setFormRegistro({...formRegistro, nombre: e.target.value})}
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Apellido"
                value={formRegistro.apellido}
                onChange={(e) => setFormRegistro({...formRegistro, apellido: e.target.value})}
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Nombre de usuario"
                value={formRegistro.nombre_usuario}
                onChange={(e) => setFormRegistro({...formRegistro, nombre_usuario: e.target.value})}
              />
              <input
                style={styles.input}
                type="email"
                placeholder="Correo electrónico"
                value={formRegistro.email}
                onChange={(e) => setFormRegistro({...formRegistro, email: e.target.value})}
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Contraseña"
                value={formRegistro.password}
                onChange={(e) => setFormRegistro({...formRegistro, password: e.target.value})}
              />
              <button onClick={registrarUsuario} style={styles.submitButton}>Registrarse</button>
            </div>
          </div>
        )}

        {vistaActual === 'crear' && usuario && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Crear Nueva Publicación</h2>
            <div style={styles.form}>
              <textarea
                style={{...styles.input, minHeight: '120px', resize: 'vertical'}}
                placeholder="¿Qué estás pensando?"
                value={formPublicacion.contenido}
                onChange={(e) => setFormPublicacion({...formPublicacion, contenido: e.target.value})}
              />
              <button onClick={crearPublicacion} style={styles.submitButton}>Publicar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#1e3a8a',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  navButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s'
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    color: '#1f2937',
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  postCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  autorNombre: {
    color: '#1e3a8a',
    fontSize: '1.1rem'
  },
  fecha: {
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  postContent: {
    color: '#374151',
    lineHeight: '1.6',
    margin: 0
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#6b7280'
  },
  noData: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '1.1rem',
    padding: '2rem'
  }
};

export default App;