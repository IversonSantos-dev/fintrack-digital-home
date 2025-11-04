import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Ana Carolina Silva",
      role: "Designer UX",
      image: testimonial1,
      text: "O Fintrack mudou completamente a forma como gerencio meu dinheiro. Agora consigo poupar mais e alcançar minhas metas financeiras!",
      rating: 5,
    },
    {
      name: "Roberto Oliveira",
      role: "Empresário",
      image: testimonial2,
      text: "Interface intuitiva e recursos poderosos. Uso diariamente para controlar tanto minhas finanças pessoais quanto da empresa.",
      rating: 5,
    },
    {
      name: "Lucas Mendes",
      role: "Estudante",
      image: testimonial3,
      text: "Perfeito para quem está começando! Os relatórios me ajudam a entender onde estou gastando demais. Recomendo muito!",
      rating: 5,
    },
  ];

  return (
    <section id="depoimentos" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            O Que Dizem Nossos Usuários
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Milhares de pessoas já transformaram suas vidas financeiras com o Fintrack
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 border-border hover:border-primary/50 transition-smooth shadow-soft hover:shadow-medium animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex space-x-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-secondary fill-secondary"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover shadow-medium"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
