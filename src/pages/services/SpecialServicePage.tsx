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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Services Spécialisés
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Solutions de transport sur mesure pour vos besoins les plus exigeants.
            Sécurité, rapidité et expertise pour tous types de marchandises spéciales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
              Demander un devis spécial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Nos certifications
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Nos Services Spécialisés
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Expertise et équipements adaptés pour transporter vos marchandises
              les plus sensibles en toute sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialServices.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Tarifs Services Spécialisés
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tarifs adaptés selon la nature et les exigences de votre marchandise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`relative bg-white border rounded-lg p-6 shadow-md ${plan.popular ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Premium
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{plan.price}</div>
                  <div className="text-sm text-gray-600">{plan.weight}</div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}>
                  Demander devis
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Processus de Transport Spécialisé
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < 4 && (
                  <ArrowRightIcon className="h-6 w-6 text-gray-400 mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Nos Certifications
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{cert.name}</h3>
                <p className="text-sm text-gray-600">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Avis de nos clients spécialisés
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez ce que disent nos clients satisfaits de nos services spécialisés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.company}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Transport spécialisé ?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Contactez notre équipe d'experts pour une solution de transport
            adaptée à vos besoins spécifiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
              Consultation gratuite
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Devis personnalisé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};