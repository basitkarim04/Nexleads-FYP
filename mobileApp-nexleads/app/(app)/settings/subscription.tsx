import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useStripe } from '@stripe/stripe-react-native';
import { AppDispatch, RootState } from '../../../src/store';
import {
  fetchPlans,
  createPaymentIntent,
  updateSubscription,
  fetchSubscriptionHistory,
  cancelSubscription,
  clearClientSecret,
} from '../../../src/store/slices/settingsSlice';
import { Plan, BillingCycle } from '../../../src/types/subscription.types';
import { fetchProfile } from '../../../src/store/slices/userSlice';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { Badge } from '../../../src/components/ui/Badge';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { formatDate, formatCurrency } from '../../../src/utils/formatters';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Radius, Spacing } from '../../../src/theme/spacing';

const planColors: Record<string, string> = {
  free: Colors.muted,
  pro: Colors.primary,
  platinum: '#a78bfa',
};

// Navy fill for the current-plan card (mirrors the web's highlighted card).
const CURRENT_BG = Colors.primary2;

export default function SubscriptionScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { plans, subscriptionHistory, clientSecret, paymentIntentId, plansLoading, paymentLoading, subscriptionLoading } =
    useSelector((s: RootState) => s.settings);
  // Subscription/plan lives on the full profile, not the minimal auth user.
  const currentPlan = useSelector((s: RootState) => s.user.profile?.subscription?.plan);
  const currentBilling = useSelector((s: RootState) => s.user.profile?.subscription?.billingCycle);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const apiBillingCycle = billing === 'annual' ? 'annually' : 'monthly';

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchSubscriptionHistory());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (clientSecret) {
      handlePaymentSheet();
    }
  }, [clientSecret]);

  const handlePaymentSheet = async () => {
    if (!clientSecret) return;
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'NexLeads',
    });
    if (initError) {
      showError(initError.message);
      dispatch(clearClientSecret());
      return;
    }
    const { error: presentError } = await presentPaymentSheet();
    if (presentError) {
      showError(presentError.message);
      dispatch(clearClientSecret());
      return;
    }

    // Stripe confirmed the card. Now persist the plan in our DB. The backend
    // requires the PaymentIntent id to verify the charge before updating the
    // user record — passing an empty string here used to make it reject with a
    // 400 while the UI still showed success, leaving the DB out of sync.
    if (!paymentIntentId) {
      showError('Payment reference missing. Please try again.');
      return;
    }

    try {
      await dispatch(
        updateSubscription({
          plan: selectedPlan as any,
          // Backend cancels the active subscription first, then activates this
          // verified paid plan.
          billingCycle: apiBillingCycle,
          paymentIntentId,
        })
      ).unwrap();
      // Only after the DB update succeeds do we refresh the profile and confirm.
      await dispatch(fetchProfile()); // refresh so the current-plan marker updates
      await dispatch(fetchSubscriptionHistory());
      showSuccess(currentPlan && currentPlan !== 'free' ? 'Subscription switched!' : 'Subscription upgraded!');
    } catch (err) {
      showError(typeof err === 'string' ? err : 'Could not update subscription. Please contact support.');
    }
  };

  const handleUpgrade = async (planName: string) => {
    const isSameActivePlan =
      planName === currentPlan &&
      (
        (billing === 'monthly' && currentBilling === 'monthly') ||
        (billing === 'annual' && currentBilling === 'annually')
      );
    if (isSameActivePlan) return;
    setSelectedPlan(planName);
    dispatch(
      createPaymentIntent({
        plan: planName as any,
        // Map UI 'annual' -> backend 'annually' so the intent is created for the
        // correct (annual) amount.
        billingCycle: apiBillingCycle,
      })
    );
  };

  const handleCancelSubscription = () => {
    if (!currentPlan || currentPlan === 'free') return;

    Alert.alert(
      'Cancel subscription?',
      'Your active subscription will be cancelled and your account will move back to the Free plan.',
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelSubscription()).unwrap();
              await dispatch(fetchProfile());
              await dispatch(fetchSubscriptionHistory());
              showSuccess('Subscription cancelled');
            } catch (err) {
              showError(typeof err === 'string' ? err : 'Could not cancel subscription.');
            }
          },
        },
      ]
    );
  };

  if (plansLoading && plans.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <LoadingSpinner size={48} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.billingToggle}>
          {(['monthly', 'annual'] as BillingCycle[]).map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => setBilling(b)}
              style={[styles.billingBtn, billing === b && styles.billingBtnActive]}
            >
              <Text style={[styles.billingText, billing === b && styles.billingTextActive]}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </Text>
              {b === 'annual' && <Text style={styles.saveBadge}>Save 20%</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {plans.map((plan) => {
          const isCurrentPlan =
            plan.id === currentPlan &&
            (
              (billing === 'monthly' && currentBilling === 'monthly') ||
              (billing === 'annual' && currentBilling === 'annually')
            );
          const color = planColors[plan.id] ?? Colors.primary;
          const isFree = plan.id === 'free';
          // Free uses a flat price; paid plans use monthly/annual.
          const price = isFree ? 0 : billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          const leadsText =
            plan.leadsLimit === -1 ? 'Unlimited leads' : `${plan.leadsLimit} leads/month`;
          const isBusy = (paymentLoading || subscriptionLoading) && selectedPlan === plan.id;
          const hasPaidActivePlan = currentPlan && currentPlan !== 'free';

          return (
            <View
              key={plan.id}
              style={[styles.planCard, isCurrentPlan && styles.planCardCurrent]}
            >
              <View style={styles.planHeader}>
                <View style={styles.flex1}>
                  <Text
                    style={[styles.planName, { color: isCurrentPlan ? '#fff' : color }]}
                  >
                    {plan.name.toUpperCase()}
                  </Text>
                  <Text style={[styles.planPrice, isCurrentPlan && styles.textOnDark]}>
                    {price === 0 ? 'Free' : formatCurrency(price ?? 0)}
                    {price !== 0 && (
                      <Text
                        style={[styles.planPeriod, isCurrentPlan && styles.textMutedOnDark]}
                      >
                        /{billing === 'monthly' ? 'mo' : 'yr'}
                      </Text>
                    )}
                  </Text>
                </View>
                {isCurrentPlan && (
                  <View style={styles.currentBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>

              <View style={styles.features}>
                <View style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={isCurrentPlan ? Colors.light.blue300 : color}
                  />
                  <Text style={[styles.featureText, isCurrentPlan && styles.textMutedOnDark]}>
                    {leadsText}
                  </Text>
                </View>
                {(plan.features ?? []).map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={isCurrentPlan ? Colors.light.blue300 : color}
                    />
                    <Text style={[styles.featureText, isCurrentPlan && styles.textMutedOnDark]}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>

              {isCurrentPlan ? (
                <>
                  <View style={styles.currentBtn}>
                    <Text style={styles.currentBtnText}>Your Current Plan</Text>
                  </View>
                  {!isFree && (
                    <TouchableOpacity
                      onPress={handleCancelSubscription}
                      disabled={subscriptionLoading}
                      activeOpacity={0.85}
                      style={styles.cancelBtn}
                    >
                      <Ionicons name="close-circle-outline" size={17} color={Colors.danger} />
                      <Text style={styles.cancelBtnText}>
                        {subscriptionLoading ? 'Cancelling...' : 'Cancel Subscription'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : isFree ? (
                <View style={styles.disabledBtn}>
                  <Text style={styles.disabledBtnText}>Downgrade</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleUpgrade(plan.id)}
                  disabled={isBusy}
                  activeOpacity={0.85}
                  style={[styles.upgradeBtn, { backgroundColor: color }]}
                >
                  <Text style={styles.upgradeBtnText}>
                    {isBusy ? 'Processing...' : hasPaidActivePlan ? 'Switch Plan' : 'Upgrade Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {subscriptionHistory.length > 0 && (
          <>
            <Text style={styles.historyTitle}>Billing History</Text>
            {subscriptionHistory.slice(0, 10).map((record) => (
              <View key={record._id} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyPlan}>{record.plan.toUpperCase()}</Text>
                  <Text style={styles.historyDate}>{formatDate(record.startDate)}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>{formatCurrency(record.price)}</Text>
                  <Badge
                    label={record.status}
                    color={
                      record.status === 'active'
                        ? Colors.success
                        : record.status === 'cancelled'
                          ? Colors.danger
                          : Colors.muted
                    }
                  />
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { padding: 4 },
  title: { ...Typography.headlineM, color: Colors.text },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.glassCard,
    borderRadius: Radius.pill,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  billingBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.pill,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  billingBtnActive: { backgroundColor: Colors.primary },
  billingText: { ...Typography.button, color: Colors.muted },
  billingTextActive: { color: '#fff' },
  saveBadge: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  flex1: { flex: 1 },
  // White card by default; current plan gets a navy fill (web parity).
  planCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  planCardCurrent: {
    backgroundColor: CURRENT_BG,
    borderColor: CURRENT_BG,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  planName: { fontFamily: 'Poppins_700Bold', fontSize: 13, letterSpacing: 1 },
  planPrice: { fontFamily: 'Poppins_900Black', fontSize: 28, color: Colors.text },
  planPeriod: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.muted },
  textOnDark: { color: '#fff' },
  textMutedOnDark: { color: Colors.light.blue300 },
  features: { gap: 6, marginBottom: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { ...Typography.body, color: Colors.muted },
  // "Current" pill on the highlighted card
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  currentBadgeText: { ...Typography.captionXS, color: '#fff', fontFamily: 'Poppins_600SemiBold' },
  // Buttons
  upgradeBtn: {
    height: 46,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeBtnText: { ...Typography.button, color: '#fff' },
  currentBtn: {
    height: 46,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  currentBtnText: { ...Typography.button, color: '#fff' },
  cancelBtn: {
    height: 42,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.sm,
    backgroundColor: `${Colors.danger}12`,
    borderWidth: 1,
    borderColor: `${Colors.danger}55`,
  },
  cancelBtnText: {
    ...Typography.button,
    color: Colors.danger,
  },
  disabledBtn: {
    height: 46,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glassInput,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  disabledBtnText: { ...Typography.button, color: Colors.muted },
  historyTitle: { ...Typography.sectionTitle, color: Colors.muted, marginBottom: Spacing.md, marginTop: Spacing.md },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  historyPlan: { ...Typography.body, color: Colors.text, fontFamily: 'Poppins_600SemiBold' },
  historyDate: { ...Typography.captionXS, color: Colors.muted },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { ...Typography.body, color: Colors.success, fontFamily: 'Poppins_700Bold' },
});
