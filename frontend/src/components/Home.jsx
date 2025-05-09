import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Home as HomeIcon,
  Info,
  ClipboardList,
  Mail,
  PenSquare,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  User,
  Phone,
  MapPin,
  Paperclip,
  Send,
  ExternalLink,
  HeartPulse,
  School,
  Car,
  ScrollText,
  Leaf,
  Building,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const Home = () => {
  const [showPetitionForm, setShowPetitionForm] = useState(false);
  const [submittedPetition, setSubmittedPetition] = useState(0);
  const [petition, setPetition] = useState('');
  const [title, setTitle] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState("submitted");
  const [inProgress, setInProgress] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setSubmittedPetition(0);
    setResolved(0);
    setInProgress(0);
  }, []);

  const departments = [
    {
      name: "Health Department",
      description: "Oversees public health, hospitals, and medical services. Ensures quality healthcare and implements disease control programs.",
      contactInfo: "https://tnhealth.tn.gov.in/",
      website: "https://www.tn.gov.in/dept_profile.php?dep_id=MTE=",
      icon: HeartPulse
    },
    {
      name: "Education Department",
      description: "Manages schools, colleges, and educational institutions. Formulates policies for literacy and quality teaching standards.",
      contactInfo: "https://tnschools.gov.in/welcome",
      website: "https://www.tn.gov.in/dept_profile.php?dep_id=Mjg=",
      icon: School
    },
    {
      name: "Transport Department",
      description: "Regulates road transport, vehicle registration, and driver licensing. Ensures safe and efficient public transportation.",
      contactInfo: "https://tnsta.gov.in/",
      website: "https://www.tn.gov.in/dept_profile.php?dep_id=MzM=",
      icon: Car
    },
    {
      name: "Revenue Department",
      description: "Manages land administration, property records, and tax collection. Handles land disputes and oversees disaster management.",
      contactInfo: "https://www.cra.tn.gov.in/mission.php",
      website: "https://www.tn.gov.in/dept_profile.php?dep_id=MjY=",
      icon: ScrollText
    },
    {
      name: "Agriculture Department",
      description: "Supports farmers with sustainable practices, crop production, and irrigation. Provides subsidies and technical guidance.",
      contactInfo: "https://www.tnagrisnet.tn.gov.in/",
      website: "https://www.tn.gov.in/dept_profile.php?dep_id=Mg==",
      icon: Leaf
    },
    {
      name: "Municipal Administration",
      description: "Oversees urban governance, infrastructure, and civic services like water supply, sanitation, and waste management.",
      contactInfo: "https://www.tnurbantree.tn.gov.in/",
      website: "https://www.tn.gov.in/dept_profile.php?dep_id=MjE=",
      icon: Building
    }
  ];

  const handleForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, verify if the petition is valid
      const verifyResponse = await axios.post('http://localhost:8000/verify', {
        petition: petition,
      });

      console.log("Verify Response:", verifyResponse.data);

      // Check if the prediction is 1 (valid petition)
      if (verifyResponse.data.prediction === 1) {
        try {
          // If verification passed, proceed with analysis
          const mlResponse = await axios.post('http://localhost:8000/analyze', {
            petition_text: petition,
            additional_context: title,
          });

          console.log("ML Response:", mlResponse.data);

          // Update this line to use the actual department from ML response
          const determinedDepartment = mlResponse.data.department || "health"; // Example: Using ML result, fallback to 'health'

          if (mlResponse.data.success === true) {
            try {
              const response = await axios.post('http://localhost:3000/api/createPetition', {
                title,
                status,
                name,
                mobile,
                address,
                department: determinedDepartment,
                petition,
              });

              if (response.status === 201) {
                setShowPetitionForm(false);
                setTitle("");
                setMobile("");
                setPetition("");
                setAddress("");
                setName("");
                setSubmittedPetition(prev => prev + 1);
                console.log("Petition submitted successfully!");
                showToast("Petition submitted successfully!", "success");
              } else {
                console.error("Petition creation failed:", response.data);
                showToast("Failed to submit petition. Please try again.", "error");
              }
            } catch (err) {
              console.error("Error submitting petition to backend:", err.response?.data || err.message);
              showToast("Error submitting petition. Please try again.", "error");
            }
          } else {
            console.warn("ML analysis did not return success:", mlResponse.data);
            showToast("Unable to process petition. Please try again.", "error");
          }
        } catch (err) {
          console.error("Error during ML analysis:", err.response?.data || err.message);
          showToast("Error analyzing petition. Please try again.", "error");
        }
      } else {
        // If the prediction is not 1, show alert message
        showToast("This does not appear to be a valid petition. Please provide a proper petition request.", "error");
      }
    } catch (err) {
      console.error("Error during petition verification:", err.response?.data || err.message);
      showToast("Error verifying petition. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message, type = "info") => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const openModal = () => setShowPetitionForm(true);
  const closeModal = () => {
    if (isSubmitting) return;
    setShowPetitionForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 font-sans">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow">
              <Landmark size={20} />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
              TN Citizen Petition Portal
            </h1>
             <h1 className="text-lg font-semibold text-gray-800 sm:hidden">
              TN Petitions
            </h1>
          </div>
          <nav>
            <ul className="flex space-x-4 sm:space-x-6 text-sm font-medium text-gray-600">
              <li><a href="#" className="flex items-center space-x-1 hover:text-blue-600 transition-colors"><HomeIcon size={16} /><span>Home</span></a></li>
              <li><a href="#" className="flex items-center space-x-1 hover:text-blue-600 transition-colors"><Info size={16} /><span>About</span></a></li>
              <li><a href="#" className="flex items-center space-x-1 hover:text-blue-600 transition-colors"><ClipboardList size={16} /><span>Status</span></a></li>
              <li><a href="#" className="flex items-center space-x-1 hover:text-blue-600 transition-colors"><Mail size={16} /><span>Contact</span></a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Toast Alert */}
        {showAlert && (
          <div className="absolute top-2 right-2 z-50 text-red-500">
            <div className={`flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg ${
              alertMessage.includes("success") 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {alertMessage.includes("success") 
                ? <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0" /> 
                : <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              }
              <div>{alertMessage}</div>
              <button 
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300"
                onClick={() => setShowAlert(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg p-8 mb-8 text-center overflow-hidden relative">
           <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/3 -translate-y-1/3 opacity-50"></div>
           <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4 opacity-50"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">Make Your Voice Heard</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Submit your petitions directly to the relevant Tamil Nadu Government departments and easily track their progress.
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-full text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-500 focus:ring-white"
            >
              <PenSquare className="mr-2 h-5 w-5" />
              Submit a Petition
            </button>
          </div>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <StatCard icon={FileText} value={submittedPetition} label="Petitions Submitted" color="blue" />
            <StatCard icon={CheckCircle2} value={resolved} label="Petitions Resolved" color="green" />
            <StatCard icon={Loader2} value={inProgress} label="Currently In Progress" color="amber" animateIcon={true}/>
          </div>


        {showPetitionForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out opacity-100" onClick={closeModal}>
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out transform scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h3 className="text-lg font-semibold text-gray-800">Submit Your Petition</h3>
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleForm} className="p-6 space-y-6">
                <div>
                  <label htmlFor="petitionTitle" className="block text-sm font-medium text-gray-700 mb-1">Subject / Title</label>
                  <input
                    id="petitionTitle"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Brief subject of your petition (e.g., Road repair needed on Main Street)"
                    required
                  />
                </div>

                <div>
                   <label htmlFor="petitionText" className="block text-sm font-medium text-gray-700 mb-1">Your Petition Details</label>
                   <textarea
                      id="petitionText"
                      value={petition}
                      onChange={(e) => setPetition(e.target.value)}
                      className="w-full p-3 h-40 border border-gray-300 rounded-md shadow-sm resize-y focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Clearly explain the issue, location (if applicable), and what action you request..."
                      required
                    />
                </div>

                <fieldset className="border border-gray-200 rounded-md p-4">
                  <legend className="text-sm font-medium text-gray-600 px-2">Your Information (Confidential)</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                     <InputWithIcon
                       id="petitionerName"
                       label="Full Name"
                       icon={User}
                       type="text"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Your Full Name"
                       required
                     />
                     <InputWithIcon
                       id="petitionerMobile"
                       label="Mobile Number"
                       icon={Phone}
                       type="tel"
                       value={mobile}
                       onChange={(e) => setMobile(e.target.value)}
                       placeholder="10-digit Mobile Number"
                       pattern="[0-9]{10}"
                       required
                     />
                  </div>
                   <div className="mt-4">
                      <InputWithIcon
                         id="petitionerAddress"
                         label="Full Address"
                         icon={MapPin}
                         isTextarea={true}
                         value={address}
                         onChange={(e) => setAddress(e.target.value)}
                         placeholder="Your Full Address (Street, Area, City, Pincode)"
                         required
                       />
                   </div>
                </fieldset>

                <div>
                  <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">Attach Documents (Optional)</label>
                  <div className="relative border border-gray-300 rounded-md shadow-sm px-3 py-2 flex items-center space-x-2 hover:border-gray-400 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                     <Paperclip size={18} className="text-gray-500" />
                     <input
                        id="attachment"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                     <span className="text-gray-600 text-sm">Click to upload relevant files (PDF, JPG, PNG)</span>
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                  >
                     <X size={16} className="mr-1.5" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="mr-1.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-1.5" /> Submit Petition
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Government Departments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <DepartmentCard key={index} department={dept} />
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white hover:underline transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors">Track Petition</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors">Government Departments</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2"><Mail size={16}/><span>petitions@tngov.in</span></li>
                <li className="flex items-center space-x-2"><Phone size={16}/><span>1800-XXX-XXXX (Toll-Free)</span></li>
                <li className="flex items-start space-x-2"><MapPin size={16} className="mt-0.5 flex-shrink-0"/><span>Secretariat, Fort St. George,<br/>Chennai - 600009</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
              <div className="flex space-x-3">
                <SocialLink href="#" icon={Twitter} label="Twitter" />
                <SocialLink href="#" icon={Facebook} label="Facebook" />
                <SocialLink href="#" icon={Youtube} label="Youtube" />
                <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Tamil Nadu Citizen Petition Portal. FOML Project.</p>
             <p className="mt-1">Designed to empower citizens.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


const StatCard = ({ icon: Icon, value, label, color = 'gray', animateIcon = false }) => {
 const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  };
  const classes = colorClasses[color] || colorClasses.gray;

  return (
     <div className={`rounded-lg shadow-sm border ${classes.border} ${classes.bg} p-5 flex items-center space-x-4 transition-shadow hover:shadow-md`}>
       <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${classes.text} bg-white shadow-inner`}>
         <Icon size={24} className={animateIcon ? 'animate-spin' : ''}/>
       </div>
       <div>
         <div className={`text-3xl font-bold ${classes.text}`}>{value}</div>
         <div className="text-sm text-gray-500">{label}</div>
       </div>
    </div>
  );
};

const DepartmentCard = ({ department }) => {
  const Icon = department.icon;
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center space-x-3">
        {Icon && <Icon size={24} />}
        <h3 className="font-semibold text-lg truncate">{department.name}</h3>
      </div>
      <div className="p-5 flex-grow">
        <p className="text-gray-600 text-sm mb-4 line-clamp-4">{department.description}</p>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <a href={department.contactInfo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
          <ExternalLink size={14} className="mr-1" /> Official Website
        </a>
        <a href={department.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
           <ExternalLink size={14} className="mr-1" /> Dept. Profile
        </a>
      </div>
    </div>
  );
};

const InputWithIcon = ({ id, label, icon: Icon, type = "text", value, onChange, placeholder, required, isTextarea = false, pattern }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      {isTextarea ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
        />
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          pattern={pattern}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
        />
      )}
    </div>
  </div>
);

const SocialLink = ({ href, icon: Icon, label }) => (
   <a
     href={href}
     target="_blank"
     rel="noopener noreferrer"
     className="w-9 h-9 bg-gray-700 hover:bg-blue-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
     aria-label={label}
   >
      <Icon size={18} />
   </a>
);


export default Home;