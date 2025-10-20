import React from 'react';
import { TruckIcon, ClockIcon, ShieldIcon, CheckCircleIcon, StarIcon, ArrowRightIcon } from 'lucide-react';

export const ShippingServicePage: React.FC = () => {
  const features = [
    {
      icon: <TruckIcon className="h-8 w-8 text-blue-600" />,
      title: "Livraison Express",
      description: "Livraison en 24-48h pour les envois standards"
    },
    {
      icon: <ShieldIcon className="h-8 w-8 text-green-600" />,
      title: "Sécurité Garantie",
      description: "Assurance complète et suivi GPS en temps réel"
    },
    {
      icon: <ClockIcon className="h-8 w-8 text-purple-600" />,
      title: "Suivi 24/7",
      description: "Suivez votre colis à tout moment via notre plateforme"
    },
    {
      icon: <CheckCircleIcon className="h-8 w-8 text-orange-600" />,
      title: "Service Fiable",
      description: "99.5% de taux de livraison réussie"
    }
  ];

  const pricing = [
    {
      name: "Standard",
      price: "À partir de 12,50€",
      weight: "0-5kg",
      delivery: "3-5 jours",
      features: ["Suivi GPS", "Assurance base", "Support client"]
    },
    {
      name: "Express",
      price: "À partir de 25,00€",
      weight: "0-10kg",
      delivery: "1-2 jours",
      features: ["Suivi GPS", "Assurance complète", "Priorité traitement", "Livraison week-end"],
      popular: true
    },
    {
      name: "Premium",
      price: "À partir de 35,00€",
      weight: "0-20kg",
      delivery: "24h",
      features: ["Suivi GPS", "Assurance maximale", "Chauffeur dédié", "Emballage spécial"]
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      company: "Boutique Paris",
      rating: 5,
      text: "Service exceptionnel ! Mes colis arrivent toujours à temps et en parfait état."
    },
    {
      name: "Pierre M.",
      company: "Tech Solutions",
      rating: 5,
      text: "Le suivi en temps réel me permet de rassurer mes clients. Excellent service."
    },
    {
      name: "Sophie B.",
      company: "Mode & Style",
      rating: 5,
      text: "Tarifs compétitifs et service professionnel. Je recommande vivement."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Service d'Expédition
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Solutions d'expédition fiables et économiques pour tous vos besoins logistiques.
            Livraison rapide, sécurisée et tracée en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Demander un devis
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Suivre un colis
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Pourquoi choisir notre service ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des années d'expérience dans la logistique nous permettent de vous offrir
              un service d'expédition de qualité supérieure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
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
              Nos Tarifs d'Expédition
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tarifs transparents et compétitifs pour tous types d'envois
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`relative bg-white border rounded-lg p-8 shadow-md ${plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Plus populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
                  <div className="text-sm text-gray-600">
                    <div>{plan.weight}</div>
                    <div>{plan.delivery}</div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}>
                  Choisir ce tarif
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
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un processus simple et efficace pour expédier vos colis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Préparation", desc: "Emballez votre colis selon nos recommandations" },
              { step: "2", title: "Collecte", desc: "Notre livreur récupère votre colis à domicile" },
              { step: "3", title: "Transport", desc: "Transit sécurisé vers la destination" },
              { step: "4", title: "Livraison", desc: "Remise en main propre au destinataire" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {index < 3 && (
                  <ArrowRightIcon className="h-6 w-6 text-gray-400 mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Avis de nos clients
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez ce que disent nos clients satisfaits
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
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à expédier ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contactez-nous dès maintenant pour obtenir un devis personnalisé
            adapté à vos besoins d'expédition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Demander un devis gratuit
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Appeler maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};