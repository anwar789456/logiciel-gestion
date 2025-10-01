// src/App.jsx
import './App.css'
import { AppProvider } from './context/AppContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import CommandesClient from './pages/commandes/CommandesClient/CommandesClient';
import AssistantIA from './pages/assistant/AssistantIA'
import RecuPaiement from './pages/recuPaiement/RecuPaiement';
import BonLivraison from './pages/bonLivraison/BonLivraison';
import BonDeSortie from './pages/bonDeSortie/BonDeSortie';
import UserList from './pages/users/UserList';
import CRM from './pages/crm/CRM';
import DemandeConge from './pages/employe/demandeConge/DemandeConge';
import Clients from './pages/clients/Clients';
import Fournisseur from './pages/fournisseur/Fournisseur';
import Caisse from './pages/caisse/Caisse';
import Products from './pages/products/Products';
import ProductOrdering from './pages/productOrdering/productOrdering';
import Categories from './pages/categories/Categories';
import TagsPage from './pages/tags/TagsPage';
import Carousel from './pages/carousel/Carousel';
import QrCode from './pages/qrCode/QrCode';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ListeEmploye from './pages/employe/ListeEmploye/ListeEmploye';
import Agenda from './pages/agenda/Agenda';
import ListeConge from './pages/employe/ListeConge/ListeConge';
import FicheCommande from './pages/ficheCommande/FicheCommande';


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
              
              {/* Protected routes - All routes are now at the top level */}
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
                <Route path="productsordering" element={<ProductOrdering />} />
                <Route path="categories" element={<Categories />} />
                <Route path="tags" element={<TagsPage />} />
                <Route path="qr-code" element={<QrCode />} />
                <Route path="carousel" element={<Carousel />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              
              {/* Flat route structure */}
              <Route path="/agenda" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Agenda />} />
              </Route>
              <Route path="/factures" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Factures />} />
              </Route>
              <Route path="/commandes" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Commandes />} />
              </Route>
              <Route path="/commandes-en-cours" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<CommandesEnCours />} />
              </Route>
              <Route path="/commandes-fiche" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<HistoriqueCommande />} />
              </Route>
              <Route path="/users" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<UserList />} />
              </Route>
              <Route path="/users-list" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<UserList />} />
              </Route>
              <Route path="/employes" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<ListeEmploye />} />
              </Route>
              <Route path="/employee-list" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<ListeEmploye />} />
              </Route>
              <Route path="/demande-conge" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<DemandeConge />} />
              </Route>
              <Route path="/employee-demande-conge" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<DemandeConge />} />
              </Route>
              <Route path="/liste-conge" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<ListeConge />} />
              </Route>
              <Route path="/employee-liste-conge" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<ListeConge />} />
              </Route>
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Clients />} />
              </Route>
              <Route path="/recu-paiement" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<RecuPaiement />} />
              </Route>
              <Route path="/recue-de-paiement-sur-commande" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<RecuPaiement />} />
              </Route>
              <Route path="/bon-livraison" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<BonLivraison />} />
              </Route>
              <Route path="/bon-de-sortie" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<BonDeSortie />} />
              </Route>
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Messages />} />
              </Route>
              <Route path="/fournisseur" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Fournisseur />} />
              </Route>
              <Route path="/devis" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Devis />} />
              </Route>
              <Route path="/commandes-fiche" element={
                <ProtectedRoute>
                  <Layout>
                    <HistoriqueCommande />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/commandes-en-cours" element={
                <ProtectedRoute>
                  <Layout>
                    <CommandesEnCours />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/assistant" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<AssistantIA />} />
              </Route>
              <Route path="/caisse" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Caisse />} />
              </Route>
              <Route path="/products" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Products />} />
              </Route>
              <Route path="/productsordering" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<ProductOrdering />} />
              </Route>
              <Route path="/categories" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Categories />} />
              </Route>
              <Route path="/tags" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<TagsPage />} />
              </Route>
              <Route path="/qr-code" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<QrCode />} />
              </Route>
              <Route path="/carousel" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Carousel />} />
              </Route>
              <Route path="/commandes-client" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<CommandesClient />} />
              </Route>
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Settings />} />
              </Route>
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<ProfilePage />} />
              </Route>
              <Route path="/crm" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<CRM />} />
              </Route>
              <Route path="/fiche-commande" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<FicheCommande />} />
              </Route>
            </Routes>
          </Router>
          
          {/* Global notification component - positioned with higher z-index */}
          <div className="fixed top-0 right-0 z-50 w-full md:w-auto">
            <NewMessageNotification />
          </div>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </WebSocketProvider>
      </AuthProvider>
    </AppProvider>
  )
}

export default App