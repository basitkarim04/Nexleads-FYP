import React, { useState, useRef, useEffect } from 'react';
import profileImage from "../../../assets/Images/feature1.png";
import { useSelector, useDispatch } from 'react-redux';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
    updatePersonalInfo,
    uploadProfilePicture,
    changePassword,
    getSubscriptionPlans,
    createPaymentIntent,
    confirmStripePayment,
    updateSubscription,
    getSubscriptionHistory,
    resetPasswordState,
    resetProfileState,
    resetPaymentState
} from '../../../Redux/Features/settingsSlice';
import { STRIPE_PUBLISHABLE_KEY } from '../../../BaseUrl';
import { toast } from 'react-toastify';
import { userData } from '../../../Redux/Features/UserDetailSlice';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Card Element Styling
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: {
            color: '#9e2146',
        },
    },
    hidePostalCode: true,
};

// Payment Modal Component (Wrapped with Stripe Elements)
const PaymentModal = ({ 
    isOpen, 
    onClose, 
    selectedPlan, 
    billingCycle, 
    getPrice, 
    pricing 
}) => {
    const dispatch = useDispatch();
    const stripe = useStripe();
    const elements = useElements();
    const { subscriptionLoading, clientSecret, paymentIntent } = useSelector(
        (state) => state.settings
    );

    const [cardholderName, setCardholderName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Create payment intent when modal opens
    useEffect(() => {
        if (isOpen && selectedPlan) {
            dispatch(createPaymentIntent({ 
                plan: selectedPlan, 
                billingCycle 
            }));
        }
    }, [isOpen, selectedPlan, billingCycle, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        if (!cardholderName.trim()) {
            alert('Please enter cardholder name');
            return;
        }

        setIsProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);

            // Step 1: Confirm payment with Stripe
            const paymentResult = await dispatch(confirmStripePayment({
                clientSecret,
                cardElement,
                stripe
            })).unwrap();

            // Step 2: Update subscription in backend
            await dispatch(updateSubscription({
                plan: selectedPlan,
                paymentIntentId: paymentResult.id,
                billingCycle
            })).unwrap();

            // Success - close modal
            dispatch(resetPaymentState());
            dispatch(userData());
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Payment Details</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-black"
                        disabled={isProcessing}
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        Upgrading to <span className="font-semibold">{selectedPlan?.charAt(0).toUpperCase() + selectedPlan?.slice(1)}</span> plan
                    </p>
                    <p className="text-2xl font-bold mt-2">
                        ${getPrice(pricing[selectedPlan])}
                        <span className="text-sm font-normal text-gray-600">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-[#062D5E]"
                            placeholder="John Doe"
                            disabled={isProcessing}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Card Details
                        </label>
                        <div className="border rounded-xl px-4 py-3 focus-within:border-[#062D5E]">
                            <CardElement options={CARD_ELEMENT_OPTIONS} />
                        </div>
                    </div>

                    {!clientSecret && (
                        <div className="text-center py-2">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#062D5E]"></div>
                            <p className="text-sm text-gray-600 mt-2">Initializing payment...</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-xl border text-sm"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!stripe || !clientSecret || isProcessing}
                            className="px-6 py-2 rounded-xl bg-[#062D5E] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                    Processing...
                                </>
                            ) : (
                                'Complete Payment'
                            )}
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <i className="ri-lock-line"></i>
                        <span>Secured by Stripe</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Dashboard Component
const DashboardSetting = () => {
    const dispatch = useDispatch();
    const { userDetails } = useSelector((state) => state.userDetail);
    const { 
        profileLoading, 
        passwordLoading, 
        subscriptionLoading,
        plans 
    } = useSelector((state) => state.settings);

    const [billingCycle, setBillingCycle] = useState("monthly");
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: '',
        bio: ''
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fileInputRef = useRef(null);

    const DISCOUNT = 0.15;

    const pricing = {
        free: 0,
        pro: 29,
        platinum: 99,
    };

    const getPrice = (monthlyPrice) => {
        if (billingCycle === "annually") {
            const yearly = monthlyPrice * 12;
            return Math.round(yearly - yearly * DISCOUNT);
        }
        return monthlyPrice;
    };

    // Initialize profile form when user details load
    useEffect(() => {
        if (userDetails) {
            setProfileForm({
                name: userDetails.name || '',
                bio: userDetails.bio || ''
            });
        }
    }, [userDetails]);

    // Fetch subscription plans on mount
    useEffect(() => {
        dispatch(getSubscriptionPlans());
        dispatch(getSubscriptionHistory());
    }, [dispatch]);

    // Handle profile picture upload
    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (JPG or PNG)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            await dispatch(uploadProfilePicture(file));
            await dispatch(userData());
        }
    };

    // Handle personal info update
    const handleUpdateProfile = async () => {
        if (!profileForm.name.trim()) {
            alert('Name is required');
            return;
        }
        
        await dispatch(updatePersonalInfo(profileForm));
        dispatch(userData());
        setIsEditOpen(false);
    };

    // Handle password change
    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('All password fields are required');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        const result = await dispatch(changePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        }));

        if (!result.error) {
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    };

    // Handle subscription upgrade
    const handleUpgradeClick = (plan) => {
        if (plan === 'free') return;
        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    };

    return (
        <div className="bg-[#F3FAFF] min-h-screen">
            <div className="w-full mx-auto bg-white rounded-3xl shadow-sm overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-6 border-b">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Settings
                    </h1>
                </div>

                {/* TABS */}
<div className="px-4 py-4 overflow-x-auto">
  <div className="flex gap-3 flex-nowrap">
    <button
      onClick={() => setActiveTab("profile")}
      className={`${
        activeTab === "profile"
          ? "bg-[#062D5E] text-[#B2DFFF]"
          : "bg-[#BFE4FF] text-[#062D5E]"
      } px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap`}
    >
      Profile Management
    </button>

    <button
      onClick={() => setActiveTab("billing")}
      className={`${
        activeTab === "billing"
          ? "bg-[#062D5E] text-[#B2DFFF]"
          : "bg-[#BFE4FF] text-[#062D5E]"
      } px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap`}
    >
      Plan & Billing
    </button>

    <button
      onClick={() => setActiveTab("security")}
      className={`${
        activeTab === "security"
          ? "bg-[#062D5E] text-[#B2DFFF]"
          : "bg-[#BFE4FF] text-[#062D5E]"
      } px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap`}
    >
      Security
    </button>
  </div>
</div>


                {/* PROFILE MANAGEMENT TAB */}
                {activeTab === "profile" && (
                    <>
                       {/* PROFILE SECTION */}
<div className="bg-white rounded-2xl shadow-sm overflow-hidden">

  {/* ================= HEADER ================= */}
  <div className="px-4 sm:px-8 pb-8 pt-8 border-b">
    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
      
      {/* Avatar */}
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 mx-auto sm:mx-0">
        <img
          src={userDetails?.profilePicture ?? profileImage}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Upload Section */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={profileLoading}
          className="border border-gray-300 rounded-full px-6 py-2 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          {profileLoading ? "Uploading..." : "Upload new photo"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePictureChange}
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
        />

        <p className="text-xs text-gray-400 mt-3 max-w-xs leading-relaxed">
          At least 800 × 800 px recommended. JPG or PNG is allowed.
        </p>
      </div>
    </div>
  </div>


  {/* ================= PERSONAL INFO ================= */}
  <div className="px-4 sm:px-8 py-8">
    <div className="border rounded-2xl p-5 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="font-semibold text-lg">Personal Info</h2>

        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center justify-center gap-2 border rounded-full px-4 py-1 text-sm hover:bg-gray-50 transition w-full sm:w-auto"
        >
          <i className="ri-edit-line"></i>
          Edit
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="break-words">
          <p className="text-sm font-semibold">Full Name</p>
          <p className="text-gray-800 break-words">
            {userDetails?.name}
          </p>
        </div>

        <div className="break-words">
          <p className="text-sm font-semibold">Platform Email</p>
          <p className="text-gray-800 break-all">
            {userDetails?.nexleadsEmail}
          </p>
        </div>

        <div className="break-words">
          <p className="text-sm font-semibold">Registered Email</p>
          <p className="text-gray-800 break-all">
            {userDetails?.email}
          </p>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-8">
        <h2 className="font-semibold text-lg mb-3">Bio</h2>

        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line break-words">
          {`Hi, I'm ${userDetails?.name}. 👋`}
          {"\n"}
          {userDetails?.bio}
        </p>
      </div>
    </div>
  </div>


  {/* ================= EDIT MODAL ================= */}
  {isEditOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">

        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            type="button"
            onClick={() => setIsEditOpen(false)}
            className="text-gray-500 hover:text-black transition"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#062D5E]"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Bio
            </label>
            <textarea
              rows="4"
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm({ ...profileForm, bio: e.target.value })
              }
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#062D5E]"
              placeholder="Write something about yourself..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setIsEditOpen(false)}
            className="px-5 py-2 rounded-xl border text-sm w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateProfile}
            disabled={profileLoading}
            className="px-6 py-2 rounded-xl bg-[#062D5E] text-white text-sm font-semibold disabled:opacity-50 w-full sm:w-auto"
          >
            {profileLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )}

</div>

                    </>
                )}

                {/* PLAN & BILLING TAB */}
                {activeTab === "billing" && (
                    <>
                        <div className="px-8 py-6 border-b">
                            <h2 className="text-3xl font-medium font-bold mb-6">Your Current Plan</h2>
                            <div className="flex items-start gap-6">
                                <div>
                                    <p className="text-gray-400 text-base mb-1">
                                        {userDetails?.subscription?.plan?.charAt(0).toUpperCase() + userDetails?.subscription?.plan?.slice(1) || 'Free'}
                                    </p>
                                    <p className="text-5xl font-bold text-gray-400">
                                        ${pricing[userDetails?.subscription?.plan || 'free']}
                                    </p>
                                </div>
                                <div className="flex-1 space-y-3 mt-2">
                                    <div className="flex items-center gap-2">
                                        <i className="ri-check-line text-gray-900 text-lg"></i>
                                        <span className="text-base text-black">
                                            {userDetails?.subscription?.leadsLimit === -1 
                                                ? 'Unlimited leads' 
                                                : `${userDetails?.subscription?.leadsLimit || 30} leads/month`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>


                       <div className="px-4 sm:px-8 py-6">
  <div
    className="
      flex flex-col sm:flex-row
      items-stretch sm:items-center
      gap-2
      bg-[#C1E8FF]
      rounded-2xl sm:rounded-full
      p-2 sm:p-1
      w-full sm:w-fit
      max-w-sm sm:max-w-none
      mx-auto
    "
  >
    {/* Monthly */}
    <label
      onClick={() => setBillingCycle("monthly")}
      className={`
        flex items-center gap-3
        w-full sm:w-auto
        px-4 py-2
        rounded-xl sm:rounded-full
        cursor-pointer
        transition-all duration-200
        ${
          billingCycle === "monthly"
            ? "bg-white shadow-sm"
            : "text-black/80"
        }
      `}
    >
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[3px] border-black flex items-center justify-center">
        {billingCycle === "monthly" && (
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#062D5E]" />
        )}
      </div>

      <span className="text-base sm:text-lg font-medium text-black">
        Monthly
      </span>
    </label>

    {/* Annually */}
    <label
      onClick={() => setBillingCycle("annually")}
      className={`
        flex items-center gap-3
        w-full sm:w-auto
        px-4 py-2
        rounded-xl sm:rounded-full
        cursor-pointer
        transition-all duration-200
        ${
          billingCycle === "annually"
            ? "bg-white shadow-sm"
            : "text-black/80"
        }
      `}
    >
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[3px] border-black flex items-center justify-center">
        {billingCycle === "annually" && (
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#062D5E]" />
        )}
      </div>

      <span className="text-base sm:text-lg font-medium text-black">
        Annually
        <span className="ml-2 text-sm text-[#2C2C2C] font-medium">
          Save 15%
        </span>
      </span>
    </label>
  </div>
</div>



                        {/* PRICING CARDS */}
                        <div className="px-8 pb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* FREE PLAN */}
                                <div className="bg-[#001933] rounded-3xl p-8 text-white">
                                    <h3 className="text-base mb-3">Free</h3>
                                    <span className="text-6xl">$0</span>
                                    <p className="text-base text-gray-300 mb-6">Basic Pricing Plan</p>
                                    <button 
                                        className="w-full bg-gray-600 py-3.5 rounded-xl font-semibold mb-4 cursor-not-allowed"
                                        disabled
                                    >
                                        {userDetails?.subscription?.plan === 'free' ? 'Your Current Plan' : 'Downgrade'}
                                    </button>
                                    <p className="text-sm text-center text-gray-400 mb-6">
                                        {billingCycle === "monthly" ? "Billed Monthly" : "Billed Annually"}
                                    </p>
                                    <div className="border-t border-gray-700 pt-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">30 leads/month</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">Basic email templates</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">Limited follow-up tracking</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PRO PLAN */}
                                <div className="bg-[#052659] rounded-3xl p-8 text-white">
                                    <h3 className="text-base mb-3">Pro</h3>
                                    <span className="text-6xl">${getPrice(pricing.pro)}</span>
                                    <p className="text-base text-gray-300 mb-6">
                                        Advanced tools for Growing
                                    </p>
                                    <button 
                                        onClick={() => handleUpgradeClick('pro')}
                                        disabled={subscriptionLoading || userDetails?.subscription?.plan === 'pro'}
                                        className="w-full bg-white text-[#001933] py-3.5 rounded-xl font-semibold mb-4 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {userDetails?.subscription?.plan === 'pro' 
                                            ? 'Current Plan' 
                                            : subscriptionLoading ? 'Processing...' : 'Upgrade Now'}
                                    </button>
                                    <p className="text-sm text-center text-gray-400 mb-6">
                                        {billingCycle === "monthly"
                                            ? "Billed Monthly"
                                            : "Billed Annually (15% off)"}
                                    </p>
                                    <div className="border-t border-gray-700 pt-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">100 leads/month</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">Custom email sequences</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">Advanced analytics</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PLATINUM PLAN */}
                                <div className="bg-[#001933] rounded-3xl p-8 text-white">
                                    <h3 className="text-base mb-3">Platinum</h3>
                                    <span className="text-6xl">${getPrice(pricing.platinum)}</span>
                                    <p className="text-base text-gray-300 mb-6">
                                        Complete Collaboration of tools
                                    </p>
                                    <button 
                                        onClick={() => handleUpgradeClick('platinum')}
                                        disabled={subscriptionLoading || userDetails?.subscription?.plan === 'platinum'}
                                        className="w-full bg-white text-[#001933] py-3.5 rounded-xl font-semibold mb-4 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {userDetails?.subscription?.plan === 'platinum' 
                                            ? 'Current Plan' 
                                            : subscriptionLoading ? 'Processing...' : 'Upgrade Now'}
                                    </button>
                                    <p className="text-sm text-center text-gray-400 mb-6">
                                        {billingCycle === "monthly"
                                            ? "Billed Monthly"
                                            : "Billed Annually (15% off)"}
                                    </p>
                                    <div className="border-t border-gray-700 pt-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">Unlimited leads</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">API access</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">Team collaboration</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-check-line text-lg"></i>
                                            <span className="text-base">Dedicated account manager</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT MODAL - Wrapped with Stripe Elements */}
                        <Elements stripe={stripePromise}>
                            <PaymentModal
                                isOpen={isPaymentModalOpen}
                                onClose={() => {
                                    setIsPaymentModalOpen(false);
                                    dispatch(resetPaymentState());
                                }}
                                selectedPlan={selectedPlan}
                                billingCycle={billingCycle}
                                getPrice={getPrice}
                                pricing={pricing}
                            />
                        </Elements>
                    </>
                )}

                {/* SECURITY TAB */}
                {activeTab === "security" && (
                    <>
                        <div className="px-8 py-6 border-b">
                            <h2 className="text-2xl font-bold mb-6">Change Password</h2>

                            <div className="mb-6">
                                <label className="block text-base font-semibold text-[#062D5E] mb-3">
                                    Current Password
                                </label>
                                <div className="relative max-w-lg">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        placeholder="Enter Current Password"
                                        className="w-full px-6 py-4 pr-14 border border-gray-300 rounded-2xl text-base placeholder-gray-300 focus:outline-none focus:border-[#062D5E]"
                                    />
                                    <button
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute mt-4 right-5 top-1/2 -translate-y-1/2"
                                        type="button"
                                    >
                                        <i className={`${showCurrentPassword ? "ri-eye-line" : "ri-eye-off-line"} text-2xl text-gray-700`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-base font-semibold text-[#062D5E] mb-3">
                                    New Password
                                </label>
                                <div className="relative max-w-lg">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        placeholder="Enter New Password"
                                        className="w-full px-6 py-4 pr-14 border border-gray-300 rounded-2xl text-base placeholder-gray-300 focus:outline-none focus:border-[#062D5E]"
                                    />
                                    <button
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute mt-4 right-5 top-1/2 -translate-y-1/2"
                                        type="button"
                                    >
                                        <i className={`${showNewPassword ? "ri-eye-line" : "ri-eye-off-line"} text-2xl text-gray-700`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-base font-semibold text-[#062D5E] mb-3">
                                    Confirm New Password
                                </label>
                                <div className="relative max-w-lg">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        placeholder="Confirm New Password"
                                        className="w-full px-6 py-4 pr-14 border border-gray-300 rounded-2xl text-base placeholder-gray-300 focus:outline-none focus:border-[#062D5E]"
                                    />
                                    <button
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute mt-4 right-5 top-1/2 -translate-y-1/2"
                                        type="button"
                                    >
                                        <i className={`${showConfirmPassword ? "ri-eye-line" : "ri-eye-off-line"} text-2xl text-gray-700`}></i>
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                                className="bg-[#062D5E] text-white px-12 py-3.5 rounded-xl text-base font-semibold hover:bg-[#041d3f] transition-colors disabled:opacity-50"
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default DashboardSetting;