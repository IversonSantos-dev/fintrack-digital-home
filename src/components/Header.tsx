import { useState, useEffect } from "react";
import { Menu, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#inicio", label: "Início" },
    { href: "#funcionalidades", label: "Funcionalidades" },
    { href: "#planos", label: "Planos" },
    { href: "#depoimentos", label: "Depoimentos" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        isScrolled
          ? "bg-card/95 backdrop-blur-lg shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#inicio" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-medium group-hover:scale-110 transition-smooth">
              <span className="text-primary-foreground font-bold text-xl">F</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Fintrack
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary font-medium transition-smooth relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex items-center space-x-2 gradient-primary shadow-medium hover:shadow-strong transition-smooth"
            >
              <Download className="w-4 h-4" />
              <span>Baixar App</span>
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-smooth"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 animate-fade-in">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-foreground hover:text-primary font-medium transition-smooth"
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="default"
              size="sm"
              className="w-full mt-4 gradient-primary shadow-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar App
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};
