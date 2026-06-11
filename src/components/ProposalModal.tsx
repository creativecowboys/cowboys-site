"use client";

import { useEffect, useRef, useState } from "react";
import { X, ArrowRight, Check } from "lucide-react";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: string;
}

export default function ProposalModal({ isOpen, onClose, source }: ProposalModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(""); // Honeypot
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus on first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;
      
      const focusableEls = modalRef.current.querySelectorAll(
        'input:not([tabindex="-1"]), select, textarea, button, a'
      );
      
      const firstEl = focusableEls[0] as HTMLElement;
      const lastEl = focusableEls[focusableEls.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleFocusTrap);
    }
    return () => {
      window.removeEventListener("keydown", handleFocusTrap);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    // Client-side validation
    if (!name.trim() || !email.trim() || !service || service === "Select a service...") {
      setStatus("error");
      setErrorMessage("Please fill out Name, Email, and select a Service.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          service,
          message,
          website_url: websiteUrl, // Honeypot
          source: `Homepage Popup (${source})`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        // Dispatch GA4 Event
        if (typeof window !== "undefined") {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "contact_form_submit_success",
            form_source: source,
            requested_service: service
          });
        }
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit. Please check your inputs.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-[560px] bg-white border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] my-8 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header Bar */}
        <div className="bg-[#0a0a0a] text-[#F2EBDA] py-4 px-6 flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            <h2 id="modal-title" className="font-anton text-sm sm:text-base tracking-[2px] uppercase m-0">
              START THE CONVERSATION
            </h2>
            <span className="hidden sm:inline-block bg-[#DD5A2E] text-white font-anton text-[9px] tracking-[1.5px] px-2.5 py-0.5 rounded-sm">
              FREE · NO PRESSURE
            </span>
          </div>
          <button 
            ref={closeBtnRef}
            onClick={onClose}
            className="text-[#F2EBDA] hover:text-[#DD5A2E] cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 sm:p-8 flex-1">
          {status === "success" ? (
            <div className="text-left animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#4CAF50] border-2 border-[#0a0a0a] rounded-full flex items-center justify-center text-white">
                  <Check size={20} />
                </div>
                <h3 className="font-anton text-2xl uppercase text-[#0a0a0a]">
                  MESSAGE RECEIVED!
                </h3>
              </div>
              <p className="font-inter text-sm text-[#5a5a5a] leading-relaxed mb-6">
                Howdy partner! Your message went straight to Josh and Dave. Here is what happens next:
              </p>

              {/* Next Steps */}
              <div className="flex flex-col gap-6 border-t-2 border-b-2 border-neutral-100 py-6 mb-6">
                <div className="flex gap-4">
                  <div className="font-anton w-6 h-6 bg-[#F5C842] border-2 border-[#0a0a0a] rounded-full flex items-center justify-center text-xs text-[#0a0a0a] shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-anton text-sm uppercase text-[#0a0a0a] mb-1">
                      WE READ &amp; REPLY
                    </h4>
                    <p className="font-inter text-xs text-[#5a5a5a] leading-relaxed">
                      We read your details and reply with follow-ups — usually within 1 business day.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="font-anton w-6 h-6 bg-[#DD5A2E] border-2 border-[#0a0a0a] rounded-full flex items-center justify-center text-xs text-white shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-anton text-sm uppercase text-[#0a0a0a] mb-1">
                      STRATEGY CALL
                    </h4>
                    <p className="font-inter text-xs text-[#5a5a5a] leading-relaxed">
                      We schedule a quick 20-minute strategy session to map out your goals.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="font-anton w-6 h-6 bg-[#005eb8] border-2 border-[#0a0a0a] rounded-full flex items-center justify-center text-xs text-white shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-anton text-sm uppercase text-[#0a0a0a] mb-1">
                      WRITTEN PROPOSAL
                    </h4>
                    <p className="font-inter text-xs text-[#5a5a5a] leading-relaxed">
                      You get a detailed, flat-rate proposal with a set timeline and clear numbers.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-[#0a0a0a] text-white py-3 font-anton uppercase text-xs tracking-wider border-[2.5px] border-[#0a0a0a] hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                CLOSE WINDOW
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left">
              {/* Spam Honeypot - completely hidden */}
              <div 
                style={{ position: "absolute", opacity: 0, zIndex: -1, pointerEvents: "none" }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="Do not fill this"
                />
              </div>

              {/* Form Grid Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5">
                    NAME *
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm outline-none focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm outline-none focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Company / Business Name */}
              <div className="mb-4">
                <label className="block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5">
                  COMPANY / BUSINESS NAME
                </label>
                <input
                  type="text"
                  placeholder="Your business"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm outline-none focus:bg-white transition-colors"
                />
              </div>

              {/* Service Select */}
              <div className="mb-4">
                <label className="block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5">
                  WHAT DO YOU NEED? *
                </label>
                <select
                  required
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm outline-none focus:bg-white transition-colors cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a0a0a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 14px center",
                    backgroundSize: "16px",
                    backgroundRepeat: "no-repeat",
                    paddingRight: "40px"
                  }}
                >
                  <option value="">Select a service...</option>
                  <option value="Web Design">Web Design</option>
                  <option value="Branding &amp; Identity">Branding &amp; Identity</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="SEO">SEO</option>
                  <option value="Full Package">Full Package</option>
                  <option value="Something Else">Something Else</option>
                </select>
              </div>

              {/* Tell us about your project */}
              <div className="mb-6">
                <label className="block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5">
                  TELL US ABOUT YOUR PROJECT
                </label>
                <textarea
                  placeholder="What are you trying to do? Rough timeline? Anything else we should know?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm min-h-[110px] resize-y outline-none focus:bg-white transition-colors"
                />
              </div>

              {/* Error Box */}
              {status === "error" && (
                <div className="mb-6 p-4 bg-[#B5330E]/10 border-2 border-[#B5330E] text-xs text-[#0a0a0a] leading-relaxed">
                  <div className="font-bold text-[#B5330E] uppercase mb-1">
                    SUBMISSION ERROR
                  </div>
                  <p className="mb-2">{errorMessage}</p>
                  <p>
                    Please try again, or contact us directly at{" "}
                    <a href="tel:4702437517" className="underline font-bold">
                      (470) 243-7517
                    </a>{" "}
                    or email{" "}
                    <a href="mailto:howdy@creativecowboys.co" className="underline font-bold">
                      howdy@creativecowboys.co
                    </a>.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-[#DD5A2E] text-white py-4 font-anton text-sm tracking-wider uppercase border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0a0a0a] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {status === "submitting" ? "SENDING MESSAGE..." : "SEND MESSAGE →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
