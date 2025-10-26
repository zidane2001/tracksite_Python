import React from 'react';
import { PackageIcon, ShieldIcon, ThermometerIcon, AlertTriangleIcon, StarIcon, CheckCircleIcon, ArrowRightIcon, ZapIcon, CrownIcon } from 'lucide-react';

export const SpecialServicePage: React.FC = () => {
  const specialServices = [
    {
      icon: <ThermometerIcon className="h-8 w-8 text-blue-600" />,
      title: "Produits Réfrigérés",
      description: "Transport de produits frais, surgelés et thermosensibles avec chaîne du froid garantie",
      features: ["Température contrôlée", "Traçabilité complète", "Urgence médicale"]
    },
    {
      icon: <ShieldIcon className="h-8 w-8 text-green-600" />,
      title: "Marchandises Dangereuses",
      description: "Transport de matières dangereuses avec certifications et conformité réglementaire",
      features: ["ADR certifié", "Équipements spécialisés", "Documents douaniers"]
    },
    {
      icon: <PackageIcon className="h-8 w-8 text-purple-600" />,
      title: "Objets de Valeur",
      description: "Transport sécurisé d'objets précieux, œuvres d'art et documents confidentiels",
      features: ["Assurance maximale", "Emballage sécurisé", "Transport discret"]
    },
    {
      icon: <ZapIcon className="h-8 w-8 text-orange-600" />,
      title: "Équipements Électroniques",
      description: "Transport spécialisé pour appareils électroniques sensibles et fragiles",
      features: ["Anti-statique", "Protection ESD", "Emballage antichoc"]
    },
    {
      icon: <CrownIcon className="h-8 w-8 text-yellow-600" />,
      title: "Transport VIP",
      description: "Service premium avec chauffeur dédié et suivi personnalisé 24/7",
      features: ["Chauffeur privé", "Suivi en temps réel", "Service porte-à-porte"]
    },
    {
      icon: <AlertTriangleIcon className="h-8 w-8 text-red-600" />,
      title: "Urgences & Priorité",
      description: "Livraison express pour situations d'urgence et besoins critiques",
      features: ["Traitement prioritaire", "Livraison week-end", "Coordination dédiée"]
    }
  ];

  const pricing = [
    {
      name: "Transport Réfrigéré",
      price: "À partir de 45,00€",
      weight: "0-50kg",
      features: ["Chaîne du froid", "Suivi température", "Livraison express"]
    },
    {
      name: "Marchandises Dangereuses",
      price: "À partir de 75,00€",
      weight: "0-100kg",
      features: ["ADR certifié", "Équipement spécialisé", "Documents légaux"]
    },
    {
      name: "Objets de Valeur",
      price: "À partir de 95,00€",
      weight: "0-30kg",
      features: ["Assurance 100k€", "Emballage musée", "Transport sécurisé"]
    },
    {
      name: "Service VIP",
      price: "À partir de 150,00€",
      weight: "Illimité",
      features: ["Chauffeur dédié", "Suivi 24/7", "Flexibilité totale"],
      popular: true
    }
  ];

  const testimonials = [
    {
      name: "Dr. Martin L.",
      company: "Clinique Paris Centre",
      rating: 5,
      text: "Service de transport réfrigéré impeccable pour nos vaccins et médicaments. Fiabilité totale !"
    },
    {
      name: "Galerie d'Art Moderne",
      company: "Paris",
      rating: 5,
      text: "Transport d'œuvres d'art d'une qualité exceptionnelle. Notre collection est entre de bonnes mains."
    },
    {
      name: "TechCorp France",
      company: "Électronique",
      rating: 5,
      text: "Équipements électroniques sensibles livrés en parfait état. Service professionnel remarquable."
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-secondary to-accent text-primary-content py-20">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Services Spécialisés
            </h1>
            <p className="text-xl text-primary-content/80 max-w-3xl mx-auto mb-8">
              Solutions de transport sur mesure pour vos besoins les plus exigeants.
              Sécurité, rapidité et expertise pour tous types de marchandises spéciales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-outline btn-primary">
                Demander un devis spécial
              </button>
              <button className="btn btn-outline btn-secondary">
                Nos certifications
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Nos Services Spécialisés
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Expertise et équipements adaptés pour transporter vos marchandises
              les plus sensibles en toute sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialServices.map((service, index) => (
              <div key={index} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="card-title justify-center">
                    {service.title}
                  </h3>
                  <p className="text-base-content/70 mb-4 text-center">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                        <span className="text-base-content">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Tarifs Services Spécialisés
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Tarifs adaptés selon la nature et les exigences de votre marchandise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`card bg-base-100 shadow-lg ${plan.popular ? 'border-secondary border-2' : ''}`}>
                {plan.popular && (
                  <div className="badge badge-secondary absolute -top-4 left-1/2 transform -translate-x-1/2">
                    Premium
                  </div>
                )}

                <div className="card-body text-center">
                  <h3 className="card-title justify-center">{plan.name}</h3>
                  <div className="text-2xl font-bold text-secondary mb-1">{plan.price}</div>
                  <div className="text-sm text-base-content/70">{plan.weight}</div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                        <span className="text-base-content">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="card-actions justify-end">
                    <button className={`btn w-full ${plan.popular ? 'btn-secondary' : 'btn-outline'}`}>
                      Demander devis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Processus de Transport Spécialisé
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Un processus rigoureux pour garantir la sécurité de vos marchandises spéciales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: "1", title: "Évaluation", desc: "Analyse des besoins spécifiques et conformité réglementaire" },
              { step: "2", title: "Préparation", desc: "Emballage spécialisé et préparation logistique" },
              { step: "3", title: "Validation", desc: "Contrôles qualité et autorisations spéciales" },
              { step: "4", title: "Transport", desc: "Transport sécurisé avec équipements adaptés" },
              { step: "5", title: "Livraison", desc: "Remise contrôlée et confirmation de réception" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="avatar mb-4">
                  <div className="w-16 rounded-full bg-secondary text-primary-content flex items-center justify-center text-xl font-bold">
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

      {/* Certifications */}
      <div className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Nos Certifications
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Certifications et agréments pour garantir la conformité
              et la sécurité de vos transports spécialisés
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { name: "ADR", desc: "Transport de matières dangereuses" },
              { name: "ATP", desc: "Transport de denrées périssables" },
              { name: "TAPA", desc: "Sécurité des transports de valeur" },
              { name: "ISO 9001", desc: "Management de la qualité" }
            ].map((cert, index) => (
              <div key={index} className="card bg-base-100 shadow-lg text-center">
                <div className="card-body">
                  <div className="avatar mb-4">
                    <div className="w-16 rounded-full bg-secondary/10">
                      <ShieldIcon className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                  <h3 className="card-title justify-center">{cert.name}</h3>
                  <p className="text-sm text-base-content/70">{cert.desc}</p>
                </div>
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
              Avis de nos clients spécialisés
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              Découvrez ce que disent nos clients satisfaits de nos services spécialisés
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
      <div className="py-16 bg-secondary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Transport spécialisé ?
          </h2>
          <p className="text-xl text-primary-content/80 mb-8 max-w-2xl mx-auto">
            Contactez notre équipe d'experts pour une solution de transport
            adaptée à vos besoins spécifiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-outline btn-primary">
              Consultation gratuite
            </button>
            <button className="btn btn-outline btn-accent">
              Devis personnalisé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};