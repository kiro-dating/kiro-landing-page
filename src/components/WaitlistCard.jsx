import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ChevronDown, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { addToWaitlist } from "../services/waitlistService";
import { validatePhoneNumber } from "../utils/phoneValidation";
import { trackEvent } from "../lib/analytics";
import "./WaitlistCard.css";

export const WaitlistCard = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1_CA");
  const [gender, setGender] = useState("gender_female");
  const [ageBracket, setAgeBracket] = useState("");

  const [isFocused, setIsFocused] = useState(false);
  const [isAgeOpen, setIsAgeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [phoneError, setPhoneError] = useState(null);
  const [hasTrackedFormView, setHasTrackedFormView] = useState(false);

  const dropdownRef = useRef(null);
  const cardRef = useRef(null);
  const formViewStartedAtRef = useRef(null);
  const hasSubmitAttemptRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAgeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-dismiss success/error message after 10 seconds
  useEffect(() => {
    if (!submitStatus) return;
    const timer = setTimeout(() => setSubmitStatus(null), 10000);
    return () => clearTimeout(timer);
  }, [submitStatus]);

  useEffect(() => {
    if (!cardRef.current || hasTrackedFormView) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          formViewStartedAtRef.current = Date.now();
          setHasTrackedFormView(true);
          trackEvent('waitlist_form_view', {
            event_category: 'engagement',
            event_label: 'Waitlist Form',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [hasTrackedFormView]);

  useEffect(() => {
    const handlePageHide = () => {
      if (!hasTrackedFormView || hasSubmitAttemptRef.current || !formViewStartedAtRef.current) {
        return;
      }

      const secondsViewed = Math.max(
        1,
        Math.round((Date.now() - formViewStartedAtRef.current) / 1000)
      );

      trackEvent('waitlist_form_abandon', {
        event_category: 'engagement',
        event_label: 'Waitlist Form',
        seconds_viewed: secondsViewed,
      });
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [hasTrackedFormView]);

  // Validate phone live when phone or country changes (only after first touch)
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (value.trim()) {
      const { error, errorKey } = validatePhoneNumber(value, countryCode);
      setPhoneError(errorKey ? t(errorKey) : error);
    } else {
      setPhoneError(null);
    }
  };

  // Re-validate when country changes and phone has a value
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setCountryCode(newCountry);
    if (phone.trim()) {
      const { error, errorKey } = validatePhoneNumber(phone, newCountry);
      setPhoneError(errorKey ? t(errorKey) : error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    hasSubmitAttemptRef.current = true;

    trackEvent('waitlist_submit_click', {
      event_category: 'engagement',
      event_label: 'Waitlist Form Submit',
    });

    // Phone validation on submit
    const { isValid, formatted, error, errorKey } = validatePhoneNumber(phone, countryCode);
    if (!isValid) {
      setPhoneError(errorKey ? t(errorKey) : error || t("waitlist.errors.invalid_phone"));
      return;
    }
    setPhoneError(null);

    setIsLoading(true);
    try {
      await addToWaitlist({
        email,
        phone: formatted, // Always store E.164 in Supabase
        country: countryCode,
        age: ageBracket,
        gender,
      });

      setSubmitStatus("success");
      trackEvent('waitlist_submit_success', {
        event_category: 'conversion',
        event_label: 'Waitlist Form',
      });

      // Reset form
      setEmail("");
      setPhone("");
      setCountryCode("+1_CA");
      setGender("gender_female");
      setAgeBracket("");
      setPhoneError(null);
    } catch (err) {
      console.error("Waitlist error:", err);
      setSubmitStatus("error");
      trackEvent('waitlist_submit_error', {
        event_category: 'error',
        event_label: 'Waitlist Form',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      id="waitlist"
      ref={cardRef}
      className="glass-panel waitlist-card"
      whileHover={{ boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="waitlist-content">
        <h2>{t("waitlist.title")}</h2>
        <p className="text-secondary">{t("waitlist.subtitle")}</p>

        <form className="waitlist-form" onSubmit={handleSubmit}>

          {/* GENDER */}
          <div className="segmented-control-wrapper">
            <div className="segmented-control">
              {['gender_female', 'gender_male', 'gender_other'].map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`segment-btn ${gender === key ? 'active' : ''}`}
                  onClick={() => setGender(key)}
                >
                  {gender === key && (
                    <motion.div
                      layoutId="segment-active-bg"
                      className="segment-active-bg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="segment-label">{t(`waitlist.${key}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AGE BRACKET */}
          <div className={`input-wrapper custom-dropdown-container ${isAgeOpen ? "focused" : ""}`} ref={dropdownRef} onClick={() => setIsAgeOpen(!isAgeOpen)}>
            <Calendar className="input-icon" size={20} />
            <div className={`dropdown-display ${!ageBracket ? "placeholder" : ""}`}>
              {ageBracket ? t(`waitlist.${ageBracket}`) : t("waitlist.age_placeholder")}
            </div>
            <ChevronDown className={`dropdown-arrow ${isAgeOpen ? "open" : ""}`} size={20} />
            {/* Native HTML5 validation bridge */}
            <input
              type="text"
              required
              readOnly
              value={ageBracket}
              style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', left: '20px', bottom: '0px', width: '1px', height: '1px' }}
              tabIndex={-1}
            />

            <AnimatePresence>
              {isAgeOpen && (
                <motion.div
                  className="dropdown-menu glass-panel"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {['age_18_30', 'age_31_42', 'age_43_60', 'age_60_plus'].map((key) => (
                    <div
                      key={key}
                      className={`dropdown-item ${ageBracket === key ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAgeBracket(key);
                        setIsAgeOpen(false);
                      }}
                    >
                      {t(`waitlist.${key}`)}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* EMAIL */}
          <div className={`input-wrapper email-wrapper ${isFocused === 'email' ? "focused" : ""}`}>
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder={t("waitlist.placeholder_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused('email')}
              onBlur={() => setIsFocused(false)}
              required
            />
          </div>

          {/* PHONE */}
          <div className={`input-wrapper phone-wrapper ${isFocused === 'phone' ? "focused" : ""}`}>
            <select
              className="country-code"
              value={countryCode}
              onChange={handleCountryChange}
            >
              <optgroup label={t("waitlist.country_groups.top")}>
                <option value="+1_CA">🇨🇦 +1 (CA)</option>
                <option value="+509_HT">🇭🇹 +509 (HT)</option>
                <option value="+1_US">🇺🇸 +1 (US)</option>
                <option value="+33_FR">🇫🇷 +33 (FR)</option>
                <option value="+55_BR">🇧🇷 +55 (BR)</option>
                <option value="+56_CL">🇨🇱 +56 (CL)</option>
                <option value="+1_DO">🇩🇴 +1 (DO)</option>
              </optgroup>
              <optgroup label={t("waitlist.country_groups.extended")}>
                <option value="+1_BS">🇧🇸 +1 (BS)</option>
                <option value="+1_TC">🇹🇨 +1 (TC)</option>
                <option value="+590_GP">🇬🇵 +590 (GP)</option>
                <option value="+596_MQ">🇲🇶 +596 (MQ)</option>
                <option value="+507_PA">🇵🇦 +507 (PA)</option>
                <option value="+52_MX">🇲🇽 +52 (MX)</option>
                <option value="+54_AR">🇦🇷 +54 (AR)</option>
                <option value="+34_ES">🇪🇸 +34 (ES)</option>
                <option value="+39_IT">🇮🇹 +39 (IT)</option>
              </optgroup>
            </select>
            <div className="divider"></div>
            <input
              type="tel"
              placeholder={t("waitlist.placeholder_phone")}
              value={phone}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused('phone')}
              onBlur={() => setIsFocused(false)}
              required
            />
          </div>

          {/* PHONE ERROR */}
          <AnimatePresence>
            {phoneError && (
              <motion.p
                className="phone-error-msg"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {phoneError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* STATUS MESSAGES */}
          <AnimatePresence>
            {submitStatus === 'success' && (
              <motion.div
                className="submit-message success-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle size={18} />
                {t("waitlist.messages.success")}
              </motion.div>
            )}
            {submitStatus === 'error' && (
              <motion.div
                className="submit-message error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle size={18} />
                {t("waitlist.messages.error")}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="btn-wrapper">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("waitlist.messages.loading") : <>{t("waitlist.button")} <ArrowRight size={18} /></>}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
