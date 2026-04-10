import React, { useState } from 'react';
import { ChevronRight, Calendar, Building2, MapPin, Edit3, Save, X, IndianRupee, User, Phone, Mail, Globe, AlertCircle, Users, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface OpportunityFormData {
    // Customer Details
    companyName: string;
    contactPerson: string;
    designation: string;
    phoneNumber: string;
    emailAddress: string;
    leadSource: string;
    
    // Deal Details
    expectedValue: string;
    expectedCloseDate: string;
    assignedTo: string;
    assignedTeam: string;
    
    // Status & Priority
    priority: 'High' | 'Medium' | 'Low';
    stage: 'Discovery' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    
    // Additional Info
    address: string;
    city: string;
    state: string;
    pincode: string;
    internalNotes: string;
}

const OpportunityEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [isEditing, setIsEditing] = useState(true); // Start in edit mode
    const [formData, setFormData] = useState<OpportunityFormData>({
        companyName: "Rajesh Electronics",
        contactPerson: "Rakesh Patil",
        designation: "CEO",
        phoneNumber: "+91 98692 26825",
        emailAddress: "rajeshelectronics@gmail.com",
        leadSource: "Dealer",
        expectedValue: "₹ 25,50,000",
        expectedCloseDate: "2026-03-31",
        assignedTo: "Rahul Patil",
        assignedTeam: "Sales Team A",
        priority: "High",
        stage: "Proposal",
        address: "Plot No. 45, MIDC Area",
        city: "Navi Mumbai",
        state: "Maharashtra",
        pincode: "400708",
        internalNotes: "Dealer contacted us for a large order. Proposal has been sent on 21st March. Evaluating competitor offers but leaning towards us due to service guarantees. Needs follow-up before end of month."
    });

    const [errors, setErrors] = useState<Partial<Record<keyof OpportunityFormData, string>>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof OpportunityFormData, string>> = {};
        
        if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
        if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
        if (!formData.emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.emailAddress = "Valid email is required";
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        if (!formData.expectedValue.trim()) newErrors.expectedValue = "Expected value is required";
        if (!formData.expectedCloseDate) newErrors.expectedCloseDate = "Expected close date is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            console.log("Saving opportunity data:", formData);
            setIsEditing(false);
            // Here you would typically make an API call to save the data
            alert("Opportunity saved successfully!");
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleInputChange = (field: keyof OpportunityFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const opportunityStages = [
        { name: 'Discovery', completed: formData.stage === 'Discovery' || ['Proposal', 'Negotiation', 'Closed Won'].includes(formData.stage) },
        { name: 'Proposal', completed: formData.stage === 'Proposal' || ['Negotiation', 'Closed Won'].includes(formData.stage) },
        { name: 'Negotiation', completed: formData.stage === 'Negotiation' || formData.stage === 'Closed Won' },
        { name: 'Closed Won', completed: formData.stage === 'Closed Won' },
    ];

    const getProgressPercentage = () => {
        const stages = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won'];
        const currentIndex = stages.indexOf(formData.stage);
        if (currentIndex === -1) return 0;
        return (currentIndex / (stages.length - 1)) * 100;
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
            <div className="max-w-6xl mx-auto">
                
                {/* Header & Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <button onClick={() => navigate(-1)} className="hover:text-[#005d52] transition-colors">Opportunities</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-medium">{id || 'OP001'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Opportunity' : 'View Opportunity Details'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 bg-white text-gray-600 px-6 py-2.5 rounded-full font-bold text-sm border border-gray-200 transition-all hover:bg-gray-50"
                                >
                                    <X size={18} /> Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#004a41] transition-all"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <button 
                                className="flex items-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#004a41] transition-all"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 size={18} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Pipeline Visualizer */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start relative max-w-3xl mx-auto">
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0" />
                            <div 
                                className="absolute top-4 left-0 h-0.5 bg-[#005d52] z-0 transition-all duration-300"
                                style={{ width: `${getProgressPercentage()}%` }}
                            />

                            {opportunityStages.map((stage, index) => (
                                <div key={index} className="relative z-10 flex flex-col items-center group">
                                    <div 
                                        className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all ${
                                            stage.completed ? 'bg-[#005d52] scale-110' : 'bg-gray-200'
                                        }`}
                                    />
                                    <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${
                                        stage.completed ? 'text-[#005d52]' : 'text-gray-400'
                                    }`}>
                                        {stage.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 space-y-12">
                        
                        {/* Section 1: Customer Info */}
                        <section>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><Building2 size={20}/></div>
                                <h3 className="font-bold text-lg text-gray-800">Customer Details</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    label="Company Name *"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={(val) => handleInputChange('companyName', val)}
                                    isEditing={isEditing}
                                    error={errors.companyName}
                                    icon={<Building2 size={16} />}
                                />
                                <FormField
                                    label="Contact Person *"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(val) => handleInputChange('contactPerson', val)}
                                    isEditing={isEditing}
                                    error={errors.contactPerson}
                                    icon={<User size={16} />}
                                />
                                <FormField
                                    label="Designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={(val) => handleInputChange('designation', val)}
                                    isEditing={isEditing}
                                    icon={<Users size={16} />}
                                />
                                <FormField
                                    label="Phone Number *"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(val) => handleInputChange('phoneNumber', val)}
                                    isEditing={isEditing}
                                    error={errors.phoneNumber}
                                    icon={<Phone size={16} />}
                                />
                                <FormField
                                    label="Email Address *"
                                    name="emailAddress"
                                    value={formData.emailAddress}
                                    onChange={(val) => handleInputChange('emailAddress', val)}
                                    isEditing={isEditing}
                                    error={errors.emailAddress}
                                    icon={<Mail size={16} />}
                                    type="email"
                                />
                                <FormField
                                    label="Lead Source"
                                    name="leadSource"
                                    value={formData.leadSource}
                                    onChange={(val) => handleInputChange('leadSource', val)}
                                    isEditing={isEditing}
                                    icon={<Globe size={16} />}
                                    type="select"
                                    options={['Dealer', 'Referral', 'Website', 'Cold Call', 'Conference', 'Partner']}
                                />
                            </div>
                        </section>

                        {/* Section 2: Deal Info */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><IndianRupee size={20}/></div>
                                <h3 className="font-bold text-lg text-gray-800">Deal Summary</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    label="Expected Value *"
                                    name="expectedValue"
                                    value={formData.expectedValue}
                                    onChange={(val) => handleInputChange('expectedValue', val)}
                                    isEditing={isEditing}
                                    error={errors.expectedValue}
                                    icon={<IndianRupee size={16} />}
                                />
                                <FormField
                                    label="Expected Close Date *"
                                    name="expectedCloseDate"
                                    value={formData.expectedCloseDate}
                                    onChange={(val) => handleInputChange('expectedCloseDate', val)}
                                    isEditing={isEditing}
                                    error={errors.expectedCloseDate}
                                    type="date"
                                    icon={<Calendar size={16} />}
                                />
                                <FormField
                                    label="Assigned To"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={(val) => handleInputChange('assignedTo', val)}
                                    isEditing={isEditing}
                                    icon={<User size={16} />}
                                    type="select"
                                    options={['Rahul Patil', 'Priya Sharma', 'Amit Kumar', 'Neha Gupta']}
                                />
                                <FormField
                                    label="Assigned Team"
                                    name="assignedTeam"
                                    value={formData.assignedTeam}
                                    onChange={(val) => handleInputChange('assignedTeam', val)}
                                    isEditing={isEditing}
                                    icon={<Users size={16} />}
                                />
                                <FormField
                                    label="Priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={(val) => handleInputChange('priority', val as 'High' | 'Medium' | 'Low')}
                                    isEditing={isEditing}
                                    type="select"
                                    options={['High', 'Medium', 'Low']}
                                />
                                <FormField
                                    label="Stage"
                                    name="stage"
                                    value={formData.stage}
                                    onChange={(val) => handleInputChange('stage', val)}
                                    isEditing={isEditing}
                                    type="select"
                                    options={['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']}
                                />
                            </div>
                        </section>

                        {/* Section 3: Location */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><MapPin size={20}/></div>
                                <h3 className="font-bold text-lg text-gray-800">Location</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FormField
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={(val) => handleInputChange('address', val)}
                                    isEditing={isEditing}
                                />
                                <FormField
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={(val) => handleInputChange('city', val)}
                                    isEditing={isEditing}
                                />
                                <FormField
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={(val) => handleInputChange('state', val)}
                                    isEditing={isEditing}
                                />
                                <FormField
                                    label="Pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={(val) => handleInputChange('pincode', val)}
                                    isEditing={isEditing}
                                />
                            </div>
                        </section>

                        {/* Section 4: Internal Notes */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-[#d1e9e7] text-[#005d52] rounded-lg"><FileText size={20}/></div>
                                <h3 className="font-bold text-lg text-gray-800">Internal Notes</h3>
                            </div>
                            {isEditing ? (
                                <textarea
                                    value={formData.internalNotes}
                                    onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                                    rows={5}
                                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#005d52] focus:border-transparent resize-none"
                                    placeholder="Add internal notes here..."
                                />
                            ) : (
                                <div className="bg-[#f1f8f7] border-l-4 border-[#005d52] p-6 rounded-r-2xl">
                                    <p className="text-sm text-gray-700 italic leading-loose">
                                        "{formData.internalNotes}"
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Form Field Component ---
interface FormFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    isEditing: boolean;
    error?: string;
    icon?: React.ReactNode;
    type?: string;
    options?: string[];
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    
    value,
    onChange,
    isEditing,
    error,
    icon,
    type = 'text',
    options
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            {icon}
            {label}
        </label>
        {isEditing ? (
            <>
                {type === 'select' && options ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005d52] focus:border-transparent text-sm ${
                            error ? 'border-red-500' : 'border-gray-200'
                        }`}
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005d52] focus:border-transparent text-sm ${
                            error ? 'border-red-500' : 'border-gray-200'
                        }`}
                    />
                )}
                {error && (
                    <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                        <AlertCircle size={12} />
                        <span>{error}</span>
                    </div>
                )}
            </>
        ) : (
            <p className={`text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700'}`}>
                {value || '-'}
            </p>
        )}
    </div>
);

export default OpportunityEdit;