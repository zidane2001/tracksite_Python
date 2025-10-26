import React from 'react';
import { PlaneIcon, ClockIcon, GlobeIcon, ShieldIcon, CheckCircleIcon, StarIcon, ArrowRightIcon } from 'lucide-react';

export const AirServicePage: React.FC = () => {
  const features = [
    {
      icon: <PlaneIcon className="h-8 w-8 text-blue-600" />,
      title: "Transport Aérien Rapide",
      description: "Livraison express par avion pour vos envois urgents"
    },
    {
      icon: <GlobeIcon className="h-8 w-8 text-green-600" />,
      title: "Couverture Internationale",
      description: "Service disponible vers plus de 200 destinations mondiales"
    },
    {
      icon: <ClockIcon className="h-8 w-8 text-purple-600" />,
      title: "Délais Garantis",
      description: "Respect des délais de livraison ou remboursement"
    },
    {
      icon: <ShieldIcon className="h-8 w-8 text-orange-600" />,
      title: "Sécurité Maximale",
      description: "Emballage spécialisé et assurance tous risques"
    }
  ];

  const destinations = [
    { country: "États-Unis", time: "7-10 jours", cost: "À partir de 85€" },
    { country: "Chine", time: "5-8 jours", cost: "À partir de 95€" },
    { country: "Japon", time: "6-9 jours", cost: "À partir de 90€" },
    { country: "Royaume-Uni", time: "2-3 jours", cost: "À partir de 65€" },
    { country: "Canada", time: "8-12 jours", cost: "À partir de 80€" },
    { country: "Australie", time: "10-14 jours", cost: "À partir de 120€" }
  ];

  const pricing = [
    {
      name: "Express Air",
      price: "À partir de 25,00€",
      weight: "0-10kg",
      delivery: "1-3 jours",
      features: ["Transport aérien prioritaire", "Suivi GPS complet", "Assurance maximale", "Douane incluse"],
      popular: true
    },
    {
      name: "Standard Air",
      price: "À partir de 15,00€",
      weight: "0-20kg",
      delivery: "3-7 jours",
      features: ["Transport aérien économique", "Suivi GPS", "Assurance standard", "Douane en option"]
    },
    {
      name: "Heavy Air",
      price: "À partir de 35,00€",
      weight: "20-50kg",
      delivery: "5-10 jours",
      features: ["Pour colis volumineux", "Manutention spécialisée", "Assurance cargo", "Transit optimisé"]
    }
  ];

  const testimonials = [
    {
      name: "Thomas D.",
      company: "Import Export Plus",
      rating: 5,
      text: "Service aérien impeccable ! Mes marchandises arrivent toujours dans les délais."
    },
    {
      name: "Sarah K.",
      company: "Global Trade Co",
      rating: 5,
      text: "La rapidité du transport aérien nous permet de satisfaire nos clients les plus exigeants."
    },
    {
      name: "Marc L.",
      company: "Tech International",
      rating: 5,
      text: "Excellent service pour nos composants électroniques sensibles."
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content py-20">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Service Aérien Express
            </h1>
            <p className="text-xl text-primary-content/80 mb-8">
              Transport aérien rapide et sécurisé pour vos envois internationaux.
              Connectez le monde en quelques jours seulement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-outline btn-primary">
                Calculer le tarif
              </button>
              <button className="btn btn-outline btn-secondary">
                Destinations disponibles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Avantages du Transport Aérien
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Découvrez pourquoi le transport aérien est la solution idéale
              pour vos envois urgents et internationaux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card bg-base-100 shadow-lg text-center">
                <div className="card-body">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="card-title justify-center">
                    {feature.title}
                  </h3>
                  <p className="text-base-content/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations Section */}
      <div className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Destinations Internationales
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Couverture mondiale avec des délais optimisés pour chaque destination
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, index) => (
              <div key={index} className="card bg-base-200 hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="card-title">{dest.country}</h3>
                    <PlaneIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2 text-sm text-base-content/70">
                    <div className="flex justify-between">
                      <span>Délai:</span>
                      <span className="font-medium">{dest.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>À partir de:</span>
                      <span className="font-medium text-primary">{dest.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Nos Tarifs Aériens
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Tarifs compétitifs pour tous vos besoins de transport aérien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`card bg-base-100 shadow-lg ${plan.popular ? 'border-primary border-2' : ''}`}>
                {plan.popular && (
                  <div className="badge badge-primary absolute -top-4 left-1/2 transform -translate-x-1/2">
                    Plus populaire
                  </div>
                )}

                <div className="card-body text-center">
                  <h3 className="card-title justify-center">{plan.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">{plan.price}</div>
                  <div className="text-sm text-base-content/70">
                    <div>{plan.weight}</div>
                    <div>{plan.delivery}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                        <span className="text-base-content">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="card-actions justify-end">
                    <button className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}>
                      Choisir ce service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Processus de Livraison Aérienne
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Un processus optimisé pour garantir la rapidité de vos envois aériens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: "1", title: "Préparation", desc: "Emballage spécialisé et documents douaniers" },
              { step: "2", title: "Collecte", desc: "Ramassage express à votre adresse" },
              { step: "3", title: "Aéroport", desc: "Traitement rapide aux douanes" },
              { step: "4", title: "Vol", desc: "Transport aérien prioritaire" },
              { step: "5", title: "Livraison", desc: "Remise au destinataire final" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="avatar mb-4">
                  <div className="w-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-base-content mb-2">{item.title}</h3>
                <p className="text-base-content/70 text-sm">{item.desc}</p>
                {index < 4 && (
                  <ArrowRightIcon className="h-6 w-6 text-base-content/40 mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Avis de nos clients internationaux
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Découvrez ce que disent nos clients satisfaits du service aérien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-warning fill-current" />
                    ))}
                  </div>
                  <p className="text-base-content mb-4 italic">"{testimonial.text}"</p>
                  <div className="font-semibold text-base-content">{testimonial.name}</div>
                  <div className="text-sm text-base-content/70">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un transport aérien ?
          </h2>
          <p className="text-xl text-primary-content/80 mb-8 max-w-2xl mx-auto">
            Contactez notre équipe spécialisée pour obtenir un devis personnalisé
            pour votre transport aérien international.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-outline btn-primary">
              Demander un devis aérien
            </button>
            <button className="btn btn-outline btn-secondary">
              Calculer le coût
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};