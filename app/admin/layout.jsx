// O painel admin não deve aparecer no Google (nem herdar o canonical da home).
export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
