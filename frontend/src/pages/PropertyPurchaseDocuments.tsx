import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, CheckCircle, XCircle, AlertCircle, 
  Clock, Home, User, Phone, Mail, MapPin, Calendar,
  Download, Eye, ArrowLeft
} from 'lucide-react';
import axios from 'axios';

interface Purchase {
  id: number;
  status: string;
  documentStatus: string;
  totalAmount: number;
  documentNotes?: string;
  documentSubmittedAt?: string;
  documentVerifiedAt?: string;
  registrationDate?: string;
  possessionDate?: string;
  purchaseDocuments: Array<{
    url: string;
    originalName: string;
    uploadedAt: string;
  }>;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  item: {
    id: number;
    title: string;
    category: string;
    price: number;
    images: string[];
    location: string;
    city: string;
    seller: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

const PropertyPurchaseDocuments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPurchaseDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/purchase/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchase(response.data);
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      alert('Error loading purchase details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPurchaseDetails();
    }
  }, [id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleSubmitDocuments = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      await axios.post(`/api/purchase/${id}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Documents submitted successfully! Admin will verify within 2-3 business days.');
      fetchPurchaseDetails();
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting documents:', error);
      alert('Error submitting documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'documents_required': return 'text-orange-600 bg-orange-100';
      case 'documents_submitted': return 'text-blue-600 bg-blue-100';
      case 'documents_verified': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'documents_required': return <AlertCircle className="h-5 w-5" />;
      case 'documents_submitted': return <Clock className="h-5 w-5" />;
      case 'documents_verified': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Purchase Not Found</h2>
          <button
            onClick={() => navigate('/account')}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back to account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/account')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Property Purchase Documents</h1>
          <p className="text-gray-600 mt-2">Submit required documents for your property purchase</p>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-4">
            <img
              src={purchase.item.images[0] || 'https://placehold.co/120x90/e5e7eb/6b7280?text=Property'}
              alt={purchase.item.title}
              className="w-24 h-18 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{purchase.item.title}</h2>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {purchase.item.location}, {purchase.item.city}
              </div>
              <div className="flex items-center text-green-600 font-semibold mt-2">
                <span className="text-lg">{formatCurrency(purchase.totalAmount)}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(purchase.status)}`}>
              {getStatusIcon(purchase.status)}
              <span className="capitalize">{purchase.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Document Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h3>
          
          <div className="space-y-4">
            {/* Status Timeline */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${purchase.status === 'documents_required' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">Documents Required</span>
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${['documents_submitted', 'documents_verified'].includes(purchase.status) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">Documents Submitted</span>
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${purchase.status === 'documents_verified' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">Documents Verified</span>
              </div>
            </div>

            {/* Current Status Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              {purchase.status === 'documents_required' && (
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Documents Required</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Please upload the required documents to proceed with your property purchase.
                    </p>
                  </div>
                </div>
              )}

              {purchase.status === 'documents_submitted' && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Documents Under Review</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Your documents have been submitted and are being reviewed by our team.
                      {purchase.documentSubmittedAt && (
                        <span className="block mt-1">
                          Submitted on: {formatDate(purchase.documentSubmittedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {purchase.status === 'documents_verified' && (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Documents Verified</p>
                    <p className="text-gray-600 text-sm mt-1">
                      All documents have been verified successfully. Your property purchase is complete!
                      {purchase.documentVerifiedAt && (
                        <span className="block mt-1">
                          Verified on: {formatDate(purchase.documentVerifiedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {purchase.documentNotes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Admin Notes:</strong> {purchase.documentNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        {purchase.status === 'documents_required' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="documents" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Property Purchase Documents
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PDF, JPG, PNG files up to 10MB each
                      </span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id="documents"
                      name="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Selected Files:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitDocuments}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Submit Documents</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Required Documents Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Required Documents:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Identity Proof (Aadhaar Card, Passport, Driving License)</li>
                <li>• Address Proof (Utility Bill, Bank Statement)</li>
                <li>• Income Proof (Salary Slip, ITR, Bank Statement)</li>
                <li>• PAN Card</li>
                <li>• Property Agreement (if available)</li>
                <li>• Any other relevant documents</li>
              </ul>
            </div>
          </div>
        )}

        {/* Submitted Documents */}
        {purchase.purchaseDocuments && purchase.purchaseDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
            
            <div className="space-y-3">
              {purchase.purchaseDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded on {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <a
                      href={doc.url}
                      download={doc.originalName}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property Details */}
        {(purchase.registrationDate || purchase.possessionDate) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchase.registrationDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Registration Date</p>
                    <p className="font-medium text-gray-900">{formatDate(purchase.registrationDate)}</p>
                  </div>
                </div>
              )}
              
              {purchase.possessionDate && (
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Possession Date</p>
                    <p className="font-medium text-gray-900">{formatDate(purchase.possessionDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPurchaseDocuments;