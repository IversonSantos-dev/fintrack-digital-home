import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    produto: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Planos", href: "#planos" },
      { label: "Download", href: "#" },
      { label: "Atualizações", href: "#" },
    ],
    empresa: [
      { label: "Sobre Nós", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carreiras", href: "#" },
      { label: "Contato", href: "#contato" },
    ],
    legal: [
      { label: "Privacidade", href: "#" },
      { label: "Termos de Uso", href: "#" },
      { label: "LGPD", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-medium">
                <span className="text-primary-foreground font-bold text-xl">F</span>
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                Fintrack
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Controle suas finanças de forma simples, inteligente e segura. 
              Baixe agora e comece a transformar sua vida financeira.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-muted hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-smooth"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">
              Produto
            </h3>
            <ul className="space-y-2">
              {links.produto.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">
              Empresa
            </h3>
            <ul className="space-y-2">
              {links.empresa.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Fintrack. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-smooth flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>contato@fintrack.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
