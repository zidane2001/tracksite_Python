import React, { useState } from 'react'
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  SendIcon,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})
interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}
export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    }, 1500)
  }
  return (
    <div className="w-full bg-base-200 overflow-x-hidden">
      <div className="hero bg-primary text-primary-content py-12">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-primary-content/80">
              We are here to answer all your questions. Don't hesitate to
              contact us.
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                  <h2 className="card-title">
                    Our Contact Details
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="avatar mr-4 mt-1">
                        <div className="w-10 rounded-full bg-primary/10">
                          <MapPinIcon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-base-content">Address</h3>
                        <p className="text-base-content/70 mt-1">
                          123 Rue de la Logistique
                          <br />
                          75001 Paris, France
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="avatar mr-4 mt-1">
                        <div className="w-10 rounded-full bg-success/10">
                          <PhoneIcon className="h-5 w-5 text-success" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-base-content">Phone</h3>
                        <p className="text-base-content/70 mt-1">
                          <a
                            href="tel:+33123456789"
                            className="link link-success"
                          >
                            +33 1 23 45 67 89
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="avatar mr-4 mt-1">
                        <div className="w-10 rounded-full bg-info/10">
                          <MailIcon className="h-5 w-5 text-info" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-base-content">Email</h3>
                        <p className="text-base-content/70 mt-1">
                          <a
                            href="mailto:contact@colisselect.com"
                            className="link link-info"
                          >
                            contact@colisselect.com
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="avatar mr-4 mt-1">
                        <div className="w-10 rounded-full bg-warning/10">
                          <ClockIcon className="h-5 w-5 text-warning" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-base-content">
                          Opening Hours
                        </h3>
                        <p className="text-base-content/70 mt-1">
                          Monday - Friday: 8:30 AM - 6:00 PM
                          <br />
                          Saturday: 9:00 AM - 12:00 PM
                          <br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg overflow-hidden h-[300px]">
                <MapContainer
                  center={[48.8566, 2.3522]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[48.8566, 2.3522]}>
                    <Popup>
                      ColisSelect
                      <br />
                      123 Rue de la Logistique
                      <br />
                      75001 Paris, France
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  Send us a message
                </h2>
              {submitSuccess ? (
                <div className="alert alert-success mb-6">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-medium">
                      Message sent successfully
                    </h3>
                    <div className="text-sm">
                      <p>
                        Thank you for contacting us. We will respond to you
                        as soon as possible.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Full Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input input-bordered input-primary w-full"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Email <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input input-bordered input-primary w-full"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="input input-bordered input-primary w-full"
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Subject <span className="text-error">*</span>
                        </span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="select select-bordered select-primary w-full"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="quote">Quote request</option>
                        <option value="tracking">Package tracking</option>
                        <option value="complaint">Complaint</option>
                        <option value="info">Information request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-6 form-control">
                    <label className="label">
                      <span className="label-text">
                        Message <span className="text-error">*</span>
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="textarea textarea-bordered textarea-primary w-full"
                      placeholder="Your message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  {submitError && (
                    <div className="alert alert-error mb-6">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="font-medium">
                          An error occurred
                        </h3>
                        <div className="text-sm">
                          <p>{submitError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="card-actions justify-end">
                    <button
                      type="submit"
                      className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : (
                        <>
                          <SendIcon size={18} className="mr-2" />
                          Send message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="bg-base-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-base-content mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-base-content/70">
                Check our answers to the most frequently asked questions
              </p>
            </div>
            <div className="card bg-base-100 shadow-lg overflow-hidden">
              <div className="divide-y divide-base-300">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-base-content mb-2">
                    How can I track my package?
                  </h3>
                  <p className="text-base-content/70">
                    You can track your package using the tracking number
                    provided during shipment. Go to our tracking page and enter
                    this number to see the current status of your shipment.
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-base-content mb-2">
                    What are your delivery times?
                  </h3>
                  <p className="text-base-content/70">
                    Our delivery times vary depending on the service chosen
                    and the destination. Generally, domestic deliveries take
                    1 to 3 business days, while international deliveries can
                    take 3 to 10 business days.
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-base-content mb-2">
                    How can I get a quote for my shipment?
                  </h3>
                  <p className="text-base-content/70">
                    You can get an instant quote using our online rate
                    calculator. Simply provide the details of your shipment,
                    including origin, destination, weight and package dimensions.
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-base-content mb-2">
                    What to do if my package is damaged or lost?
                  </h3>
                  <p className="text-base-content/70">
                    If your package is damaged or lost, please contact us as
                    soon as possible. We will ask you to provide the tracking
                    number and details about the issue. Our customer service
                    team will process your claim as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

