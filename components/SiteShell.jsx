import Header from './Header';
import Footer from './Footer';

export default function SiteShell({ children, activeNav }) {
  return (
    <>
      <Header activeNav={activeNav} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
