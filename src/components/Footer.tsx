import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t-2 border-green/40 bg-gradient-to-b from-green-muted to-background px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-4">
              Christoph<span className="text-primary">.</span>
            </h3>
            <p className="text-sm text-green-light leading-relaxed max-w-xs">
              A full-service creative studio delivering premium audio, video, and broadcast production in Lagos, Nigeria.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold tracking-widest text-primary mb-4">NAVIGATE</h4>
            <ul className="space-y-2">
              {[
                { label: "Services", path: "/services" },
                { label: "Portfolio", path: "/portfolio" },
                { label: "Book a Session", path: "/booking" },
                { label: "Contact", path: "/contact" },
              ].map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-green-light hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold tracking-widest text-primary mb-4">CONTACT</h4>
            <ul className="space-y-2 text-sm text-green-light">
              <li>Lagos, Nigeria</li>
              <li>info@christophstudios.com</li>
              <li>+234 000 000 0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-green/30 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Christoph Media Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
