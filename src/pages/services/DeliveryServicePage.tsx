import React from 'react';
import { TruckIcon, ClockIcon, MapPinIcon, ShieldIcon, CheckCircleIcon, StarIcon, ArrowRightIcon, PhoneIcon, HomeIcon } from 'lucide-react';

export const DeliveryServicePage: React.FC = () => {
  const features = [
    {
      icon: <TruckIcon className="h-8 w-8 text-blue-600" />,
      title: "Livraison Express",
      description: "Service de livraison rapide dans toute la France métropolitaine"
    },
    {
      icon: <HomeIcon className="h-8 w-8 text-green-600" />,
      title: "Livraison à Domicile",
      description: "Remise en main propre à l'adresse de destination"
    },
    {
      icon: <ClockIcon className="h-8 w-8 text-purple-600" />,
      title: "Créneaux Horaires",
      description: "Choix de créneaux horaires pour une livraison flexible"
    },
    {
      icon: <ShieldIcon className="h-8 w-8 text-orange-600" />,
      title: "Suivi en Temps Réel",
      description: "Suivez votre livraison minute par minute"
    }
  ];

  const services = [
    {
      name: "Livraison Standard",
      time: "2-3 jours ouvrés",
      price: "À partir de 8,50€",
      features: ["Suivi SMS", "Assurance base", "Signature requise"]
    },
    {
      name: "Livraison Express",
      time: "24-48h",
      price: "À partir de 15,00€",
      features: ["Suivi GPS", "Assurance complète", "Livraison week-end", "Notification en temps réel"],
      popular: true
    },
    {
      name: "Livraison Same Day",
      time: "Même journée",
      price: "À partir de 25,00€",
      features: ["Service premium", "Chauffeur dédié", "Confirmation immédiate", "Suivi minute par minute"]
    },
    {
      name: "Livraison Internationale",
      time: "5-15 jours",
      price: "À partir de 45,00€",
      features: ["Douane incluse", "Assurance internationale", "Suivi international", "Documents douaniers"]
    }
  ];

  const zones = [
    { zone: "Paris & Île-de-France", time: "24-48h", cost: "8,50€ - 15,00€" },
    { zone: "Grand Ouest", time: "2-3 jours", cost: "12,00€ - 18,00€" },
    { zone: "Grand Est", time: "2-3 jours", cost: "10,50€ - 16,00€" },
    { zone: "Sud-Est", time: "2-4 jours", cost: "14,00€ - 20,00€" },
    { zone: "DOM-TOM", time: "7-15 jours", cost: "35,00€ - 65,00€" }
  ];

  const testimonials = [
    {
      name: "Sophie M.",
      company: "E-commerce Paris",
      rating: 5,
      text: "Service de livraison exceptionnel ! Mes clients sont toujours satisfaits de la rapidité et du professionnalisme."
    },
    {
      name: "Jean-Pierre L.",
      company: "Restaurant Lyon",
      rating: 5,
      text: "Les livraisons arrivent toujours à l'heure. Le système de suivi est très pratique."
    },
    {
      name: "Marie C.",
      company: "Boutique Marseille",
      rating: 5,
      text: "Excellent service client et délais respectés. Je recommande vivement."
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-success to-primary text-primary-content py-20">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Service de Livraison
            </h1>
            <p className="text-xl text-primary-content/80 max-w-3xl mx-auto mb-8">
              Solutions de livraison fiables et rapides pour tous vos besoins.
              De la livraison express à la distribution internationale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-outline btn-primary">
                Demander une livraison
              </button>
              <button className="btn btn-outline btn-secondary">
                Suivre ma livraison
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
              Nos Services de Livraison
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Découvrez tous les avantages de nos services de livraison
              professionnels et fiables.
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

      {/* Services Section */}
      <div className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Nos Formules de Livraison
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Choisissez la formule qui correspond à vos besoins de livraison
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className={`card bg-base-100 shadow-lg ${service.popular ? 'border-success border-2' : ''}`}>
                {service.popular && (
                  <div className="badge badge-success absolute -top-4 left-1/2 transform -translate-x-1/2">
                    Plus populaire
                  </div>
                )}

                <div className="card-body text-center">
                  <h3 className="card-title justify-center">{service.name}</h3>
                  <div className="text-2xl font-bold text-success mb-1">{service.price}</div>
                  <div className="text-sm text-base-content/70">{service.time}</div>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                        <span className="text-base-content">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="card-actions justify-end">
                    <button className={`btn w-full ${service.popular ? 'btn-success' : 'btn-outline'}`}>
                      Choisir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zones Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Zones de Livraison
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Couverture nationale avec des tarifs adaptés à chaque région
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {zones.map((zone, index) => (
              <div key={index} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="card-title">{zone.zone}</h3>
                    <MapPinIcon className="h-6 w-6 text-success" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Délai:</span>
                      <span className="font-medium">{zone.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Tarif:</span>
                      <span className="font-medium text-success">{zone.cost}</span>
                    </div>
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
              Comment ça marche ?
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Un processus simple en 4 étapes pour vos livraisons
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Commande", desc: "Passez votre commande en ligne ou par téléphone" },
              { step: "2", title: "Collecte", desc: "Notre équipe récupère votre colis" },
              { step: "3", title: "Transport", desc: "Livraison sécurisée vers la destination" },
              { step: "4", title: "Réception", desc: "Confirmation de livraison et signature" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="avatar mb-4">
                  <div className="w-16 rounded-full bg-success text-primary-content flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-base-content mb-2">{item.title}</h3>
                <p className="text-base-content/70 text-sm">{item.desc}</p>
                {index < 3 && (
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
              Avis de nos clients
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Découvrez ce que disent nos clients satisfaits de notre service de livraison
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
      <div className="py-16 bg-success text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'une livraison ?
          </h2>
          <p className="text-xl text-primary-content/80 mb-8 max-w-2xl mx-auto">
            Contactez notre équipe pour organiser votre livraison.
            Service rapide et professionnel garanti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-outline btn-primary">
              Demander un devis
            </button>
            <button className="btn btn-outline btn-secondary">
              <PhoneIcon className="h-5 w-5 mr-2" />
              Appeler maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};