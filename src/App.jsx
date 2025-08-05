// src/App.jsx
import './App.css'
import { AppProvider } from './context/AppContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/home/Home';
import Messages from './pages/messages/Messages';
import Settings from './pages/settings/Settings';
import Stats from './pages/stats/Stats';
import Factures from './pages/factures/Factures';
import Devis from './pages/devis/Devis';
import NewMessageNotification from './components/common/NewMessageNotification';
import CommandesEnCours from './pages/commandes/Encours/EnCours';
import HistoriqueCommande from './pages/commandes/Historique/Historique';
import Stock from './pages/stock/Stock';
import AssistantIA from './pages/assistant/AssistantIA'
import RecuDePaiement from './pages/recuPaiement/RecuDePaiement';
import BonLivraison from './pages/bonLivraison/BonLivraison';
import Clients from './pages/clients/Clients';
import FicheEmploye from './pages/employe/ficheEmploye/FicheEmploye';
import DemandeConge from './pages/employe/demandeConge/DemandeConge';
import Fournisseur from './pages/fournisseur/Fournisseur';
import Caisse from './pages/caisse/Caisse';
import Products from './pages/products/Products';
import Categories from './pages/categories/Categories';
import Carousel from './pages/carousel/Carousel';



function App() {
  return (
    <AppProvider>
      <WebSocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="stats" element={<Stats />} />
              <Route path="factures" element={<Factures />} />
              <Route path="commandes/en-cours" element={<CommandesEnCours  />} />
              <Route path="commandes/fiche" element={<HistoriqueCommande  />} />
              <Route path="employee/list" element={<FicheEmploye />} />
              <Route path="employee/demande-conge" element={<DemandeConge />} />
              <Route path="clients" element={<Clients />} />
              <Route path="recue-de-paiement-sur-commande" element={<RecuDePaiement />} />
              <Route path="bon-livraison" element={<BonLivraison />} />
              <Route path="messages" element={<Messages />} />
              <Route path="stock" element={<Stock />} />
              <Route path="fournisseur" element={<Fournisseur />} />
              <Route path="devis" element={<Devis />} />
              <Route path="assistant-ia" element={<AssistantIA />} />
              <Route path="caisse" element={<Caisse />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="carousel" element={<Carousel />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        
        {/* Global notification component - positioned with higher z-index */}
        <div className="fixed top-0 right-0 z-50 w-full md:w-auto">
          <NewMessageNotification />
        </div>
      </WebSocketProvider>
    </AppProvider>
  )
}

export default App