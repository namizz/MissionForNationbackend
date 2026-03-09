// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { store } from './store';

// // Layouts & Pages
// import DashboardLayout from './layouts/DashboardLayout';
// import LoginPage from './pages/LoginPage';
// import Dashboard from './pages/Dashboard';
// import Regions from './pages/Regions';
// import Invitations from './pages/Invitations';
// import Posts from './pages/Posts';
// import ProtectedRoute from './components/ProtectedRoute';

// export default function App() {
//   return (
//     <Provider store={store}>
//       <BrowserRouter>
//         <Routes>
//           {/* Public Route */}
//           <Route path="/login" element={<LoginPage />} />

//           {/* Protected Routes - All these require being logged in */}
//           <Route 
//             path="/" 
//             element={
//               <ProtectedRoute>
//                 <DashboardLayout />
//               </ProtectedRoute>
//             }
//           >
//             {/* These render inside the <Outlet /> of DashboardLayout */}
//             <Route index element={<Dashboard />} />
//             <Route path="regions" element={<Regions />} />
//             <Route path="invitations" element={<Invitations />} />
//             <Route path="posts" element={<Posts />} />
//           </Route>

//           {/* Redirect any unknown routes to home */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </Provider>
//   );
// }
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { Provider } from 'react-redux';
import { store } from './store';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </Provider>
  );
}