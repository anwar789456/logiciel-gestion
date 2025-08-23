// src/App.jsx
import './App.css'
import { AppProvider } from './context/AppContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Messages from './pages/messages/Messages';
import Settings from './pages/settings/Settings';
import Stats from './pages/stats/Stats';
import ProfilePage from './pages/profile/ProfilePage';
import Factures from './pages/factures/Factures';
import Devis from './pages/devis/Devis';
import NewMessageNotification from './components/common/NewMessageNotification';
import CommandesEnCours from './pages/commandes/Encours/EnCours';
import HistoriqueCommande from './pages/commandes/Historique/Historique';
import Commandes from './pages/commandes/Commandes';
import AssistantIA from './pages/assistant/AssistantIA'
import RecuPaiement from './pages/recuPaiement/RecuPaiement';
import BonLivraison from './pages/bonLivraison/BonLivraison';
import Clients from './pages/clients/Clients';
import UserList from './pages/users/UserList';
import DemandeConge from './pages/employe/demandeConge/DemandeConge';
import Fournisseur from './pages/fournisseur/Fournisseur';
import Caisse from './pages/caisse/Caisse';
import Products from './pages/products/Products';
import Categories from './pages/categories/Categories';
import Carousel from './pages/carousel/Carousel';
import QrCode from './pages/qrCode/QrCode';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ListeEmploye from './pages/employe/ListeEmploye/ListeEmploye';
import Agenda from './pages/agenda/Agenda';
import ListeConge from './pages/employe/ListeConge/ListeConge';


function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Stats />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="factures" element={<Factures />} />
                <Route path="commandes" element={<Commandes />} />
                <Route path="commandes/en-cours" element={<CommandesEnCours />} />
                <Route path="commandes/fiche" element={<HistoriqueCommande />} />
                <Route path="users/list" element={<UserList />} />
                {/* Redirecting old employee/list route to users/list */}
                <Route path="employee/list" element={<ListeEmploye />} />
                <Route path="employee/demande-conge" element={<DemandeConge />} />
                <Route path="employee/liste-conge" element={<ListeConge />} />
                <Route path="clients" element={<Clients />} />
                <Route path="recue-de-paiement-sur-commande" element={<RecuPaiement />} />
                <Route path="bon-livraison" element={<BonLivraison />} />
                <Route path="messages" element={<Messages />} />
                {/* <Route path="stock" element={<Stock />} /> */}
                <Route path="fournisseur" element={<Fournisseur />} />
                <Route path="devis" element={<Devis />} />
                <Route path="factures" element={<Factures />} />
                <Route path="assistant-ia" element={<AssistantIA />} />
                <Route path="caisse" element={<Caisse />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="qr-code" element={<QrCode />} />
                <Route path="carousel" element={<Carousel />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Router>
          
          {/* Global notification component - positioned with higher z-index */}
          <div className="fixed top-0 right-0 z-50 w-full md:w-auto">
            <NewMessageNotification />
          </div>
        </WebSocketProvider>
      </AuthProvider>
    </AppProvider>
  )
}

export default App