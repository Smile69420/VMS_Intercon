/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

// --- CONFIGURATION & CONSTANTS ---

const AppConfig = {
    ADMIN_PASSWORD: 'Mccia@2025',
    GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbxvDy8MM_nTJp7igLDruaG35oN1mm6WiiNx8mpPbEMH6bmUxtWsFHsE1R9Uyu4BH9C9/exec',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDtag05HpGc_XlBulhz874wzneTpjgJ25E', // Key for geolocation features.
    PURPOSE_OPTIONS: ['Meeting with HOD', 'Membership Inquiry', 'Business Visit', 'Event/Workshop', 'CoFo','Visa Recomendation Letter',],
    DEFAULT_BRANCHES: [
        { name: "Tilak Road", lat: 18.5101, lon: 73.8475 },
        { name: "Senapati Bapat Road", lat: 18.5309, lon: 73.8285 },
        { name: "Hadapsar", lat: 18.5033, lon: 73.9310 },
        { name: "Bhosari", lat: 18.6324, lon: 73.8427 },
        { name: "Ahilyanagar", lat: 19.0952, lon: 74.7439 }
    ],
    DEFAULT_DIRECTORS: [
        { name: "Abhishek Awate", email: "abhisheka@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Aniruddha Brahma", email: "aniruddhab@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Chintamani Shrotri", email: "chintamanis@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Ganesh Mate", email: "ganeshm@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Ismail Patel", email: "ismail.fellow@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Kirti Kendhe", email: "kirtik@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Mahesh Kabadi", email: "maheshk@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Mandar Marathe", email: "mandarm@mcciapune.com", location: "Bhosari" },
        { name: "Neeraj Thakur", email: "neerajt@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Nikhil Jain", email: "nikhilj@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Nilesh Gaikwad", email: "nileshgaikwad1118@gmail.com", location: "Senapati Bapat Road" },
        { name: "Nisha Jadhav", email: "nishaj@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Parikshit Das", email: "parikshitd@mcciapune.com", location: "Hadapsar" },
        { name: "Prashant Girbane", email: "dg@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Prashant Jogalekar", email: "prashantj@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Priyanka Sharma", email: "priyankas@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Rajnikant Gaikwad", email: "engineer@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Sandhya Acharya", email: "sandhyaa@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Sanjay Kirloskar", email: "president@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Sarika Damle", email: "sarikad@mcciapune.com", location: "Tilak Road" },
        { name: "Sasidharan Puthiya Veettil", email: "sasidharan@mcciapune.com", location: "Tilak Road" },
        { name: "Satavisha Natu", email: "satavishan@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Satish Joshi", email: "satishj@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Shantanu Jagtap", email: "shantanuj@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Shreyas Wakhare", email: "shreyasw.edu@gmail.com", location: "Tilak Road" },
        { name: "Shrikrishna Gadgil", email: "ceo@mecf.in", location: "Senapati Bapat Road" },
        { name: "Shriram Joshi", email: "shriramj@mcciapune.com", location: "Tilak Road" },
        { name: "Sonal Phadnis", email: "sonalp@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Sudhanwa Kopardekar", email: "sudhanwak@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Swapnil Gawai", email: "swapnilg@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Tejas Narute", email: "aefc@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Varsha Mahajan", email: "varsham@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Vrushali Patale", email: "designer@mcciapune.com", location: "Senapati Bapat Road" },
        { name: "Dnyaneshwar Bandre", email: "dnyaneshwarb@mcciapune.com", location: "Senapati Bapat Road" },
    ]
};


// --- TYPE DEFINITIONS ---

interface Visitor {
  id: string;
  name: string;
  email: string;
  company?: string;
  designation?: string;
  mobileNumber?: string;
  purpose: string;
  host: string;
  hostEmail?: string;
  branchLocation: string;
  checkInTime: Date;
  synced?: 'syncing' | 'success' | 'failed';
}

interface FormErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  purpose?: string;
  otherPurposeDetail?: string;
  host?: string;
  branchLocation?: string;
  ocr?: string;
}

interface OcrData {
  fullName?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  company?: string | null;
  designation?: string | null;
}

interface Director {
  name: string;
  email: string;
  location: string;
}

interface Branch {
  name: string;
  lat: number;
  lon: number;
}

// More specific types for Google Maps API
interface GeocoderResult {
  formatted_address: string;
}
interface GeocoderResponse {
  results: GeocoderResult[];
  status: google.maps.GeocoderStatus;
}

// Correctly define the google.maps namespace for TypeScript
declare namespace google {
    namespace maps {
        type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
        
        interface GeocoderResult {
            formatted_address: string;
        }

        class LatLng {
            constructor(lat: number, lng: number);
            lat(): number;
            lng(): number;
        }
        
        class Geocoder {
            geocode(
                request: { location: LatLng },
                callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
            ): void;
        }
    }
}


declare global {
  interface Window {
    google?: {
      maps: {
        Geocoder: typeof google.maps.Geocoder;
        GeocoderStatus: {
            OK: google.maps.GeocoderStatus;
        };
        LatLng: typeof google.maps.LatLng;
      };
    };
  }
}


// --- API & UTILITY FUNCTIONS ---

let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  console.error("API_KEY environment variable not provided. OCR functionality will be disabled.");
}

const loadGoogleMapsScript = () => {
    const googleMapsApiKey = AppConfig.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
        console.error("Google Maps API key is not set in AppConfig. Geolocation features will be limited.");
        return;
    }
    if (document.getElementById('google-maps-script')) {
        return; // Script already loaded or is loading
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=geocoding`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
};


const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
    }
    return defaultValue;
};

const resizeImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get 2D canvas context."));
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = (error) => reject(new Error("Failed to load image for resizing."));
        img.src = dataUrl;
    });
};

// --- HELPER HOOKS ---

const useFocusTrap = (ref: React.RefObject<HTMLElement>, isOpen: boolean, onClose?: () => void) => {
    const previousFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen && ref.current) {
            previousFocus.current = document.activeElement as HTMLElement;
            const focusableElements = ref.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            firstElement.focus();

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                } else if (e.key === 'Escape' && onClose) {
                    onClose();
                }
            };
            
            const currentRef = ref.current;
            currentRef.addEventListener('keydown', handleKeyDown);

            return () => {
                currentRef.removeEventListener('keydown', handleKeyDown);
                if (previousFocus.current) {
                    previousFocus.current.focus();
                }
            };
        }
    }, [isOpen, ref, onClose]);
};


// --- UI COMPONENTS ---

const PasswordModal: React.FC<{
    onClose: () => void;
    onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, true, onClose);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === AppConfig.ADMIN_PASSWORD) {
            onSuccess();
        } else {
            setError('Incorrect password.');
            setPassword('');
        }
    };

    return (
        <div className="admin-dashboard-overlay" onClick={onClose}>
            <div ref={modalRef} className="admin-dashboard card password-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="password-title">
                <button className="close-admin-button" onClick={onClose} aria-label="Close">&times;</button>
                <h2 id="password-title">Admin Access</h2>
                <form onSubmit={handleSubmit} className="admin-form">
                    <p>Please enter the password to access the dashboard.</p>
                    <div className="form-group">
                        <label htmlFor="admin-password">Password</label>
                        <input
                            type="password"
                            id="admin-password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            required
                            autoFocus
                            aria-invalid={!!error}
                        />
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    <button type="submit" className="button primary full-width">Enter</button>
                </form>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    branches: Branch[];
    setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
    directors: Director[];
    setDirectors: React.Dispatch<React.SetStateAction<Director[]>>;
}> = ({ isOpen, onClose, branches, setBranches, directors, setDirectors }) => {
    const [adminError, setAdminError] = useState('');
    const [newBranchName, setNewBranchName] = useState('');
    const [newBranchLat, setNewBranchLat] = useState('');
    const [newBranchLon, setNewBranchLon] = useState('');
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [editBranchData, setEditBranchData] = useState({ lat: '', lon: '' });
    const [newDirectorName, setNewDirectorName] = useState('');
    const [newDirectorEmail, setNewDirectorEmail] = useState('');
    const [newDirectorLocation, setNewDirectorLocation] = useState('');
    
    const dashboardRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dashboardRef, isOpen, onClose);

    useEffect(() => {
        if (isOpen) {
            setAdminError('');
            if (branches.length > 0) setNewDirectorLocation(branches[0].name);
        }
    }, [isOpen, branches]);
    
    const handleAddBranch = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        if (!newBranchName.trim()) return setAdminError('Branch name cannot be empty.');
        if (branches.some(b => b.name.toLowerCase() === newBranchName.trim().toLowerCase())) return setAdminError('This branch already exists.');
        const lat = parseFloat(newBranchLat), lon = parseFloat(newBranchLon);
        if (isNaN(lat) || lat < -90 || lat > 90) return setAdminError('Latitude must be a valid number between -90 and 90.');
        if (isNaN(lon) || lon < -180 || lon > 180) return setAdminError('Longitude must be a valid number between -180 and 180.');
        setBranches(prev => [...prev, { name: newBranchName.trim(), lat, lon }]);
        setNewBranchName(''); setNewBranchLat(''); setNewBranchLon('');
    };
    
    const handleSaveEditBranch = () => {
        if (!editingBranch) return;
        const lat = parseFloat(editBranchData.lat), lon = parseFloat(editBranchData.lon);
        if (isNaN(lat) || lat < -90 || lat > 90) return setAdminError('Latitude must be a valid number between -90 and 90.');
        if (isNaN(lon) || lon < -180 || lon > 180) return setAdminError('Longitude must be a valid number between -180 and 180.');
        setBranches(prev => prev.map(b => b.name === editingBranch.name ? { ...b, lat, lon } : b));
        setEditingBranch(null); setAdminError('');
    };

    const handleAddDirector = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        if (!newDirectorName.trim() || !newDirectorEmail.trim() || !newDirectorLocation) return setAdminError('All host fields are required.');
        if (!/\S+@\S+\.\S+/.test(newDirectorEmail)) return setAdminError("Host email is invalid.");
        if (directors.some(d => d.email.toLowerCase() === newDirectorEmail.trim().toLowerCase())) return setAdminError('A host with this email already exists.');
        setDirectors(prev => [...prev, { name: newDirectorName.trim(), email: newDirectorEmail.trim(), location: newDirectorLocation }].sort((a, b) => a.name.localeCompare(b.name)));
        setNewDirectorName(''); setNewDirectorEmail('');
    };

    return (
        <div className="admin-dashboard-overlay" onClick={onClose}>
            <div ref={dashboardRef} className="admin-dashboard card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-title">
                <button className="close-admin-button" onClick={onClose}>&times;</button>
                <h2 id="admin-title">Admin Dashboard</h2>
                {adminError && <div className="admin-error-message card">{adminError} <button onClick={() => setAdminError('')}>&times;</button></div>}
                
                 <div className="admin-sections">
                    <div className="admin-section">
                        <h3>Manage Branches</h3>
                        <div className="admin-list-container">
                          <ul className="admin-list">
                               {branches.map(branch => (
                                    <li key={branch.name} className={`admin-list-item ${editingBranch?.name === branch.name ? 'editing' : ''}`}>
                                        {editingBranch?.name === branch.name ? (
                                            <>
                                                <div className="admin-item-content editing-form">
                                                    <span className="item-name-static">{branch.name}</span>
                                                    <div className="lat-lon-group">
                                                        <input type="number" step="any" placeholder="Latitude" value={editBranchData.lat} onChange={e => setEditBranchData(p => ({...p, lat: e.target.value}))} />
                                                        <input type="number" step="any" placeholder="Longitude" value={editBranchData.lon} onChange={e => setEditBranchData(p => ({...p, lon: e.target.value}))} />
                                                    </div>
                                                </div>
                                                <div className="admin-item-actions">
                                                    <button onClick={handleSaveEditBranch} className="button primary small-btn">Save</button>
                                                    <button onClick={() => setEditingBranch(null)} className="button secondary small-btn">Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="admin-item-content">
                                                    <span>{branch.name}</span>
                                                    <small>Lat: {branch.lat.toFixed(4)}, Lon: {branch.lon.toFixed(4)}</small>
                                                </div>
                                                <div className="admin-item-actions">
                                                    <button onClick={() => { setEditingBranch(branch); setEditBranchData({ lat: branch.lat.toString(), lon: branch.lon.toString() }); }} className="button secondary small-btn">Edit</button>
                                                    <button onClick={() => setBranches(p => p.filter(b => b.name !== branch.name))} className="button danger small-btn">Remove</button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                               ))}
                          </ul>
                        </div>
                        <form onSubmit={handleAddBranch} className="admin-form">
                            <input type="text" placeholder="New branch name" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} required />
                            <div className="lat-lon-group">
                                <input type="number" step="any" placeholder="Latitude" value={newBranchLat} onChange={e => setNewBranchLat(e.target.value)} required />
                                <input type="number" step="any" placeholder="Longitude" value={newBranchLon} onChange={e => setNewBranchLon(e.target.value)} required />
                            </div>
                            <button type="submit" className="button primary">Add Branch</button>
                        </form>
                    </div>
                    <div className="admin-section">
                        <h3>Manage Hosts</h3>
                         <div className="admin-list-container">
                            <ul className="admin-list">
                                {directors.map(dir => (
                                    <li key={dir.email} className="admin-list-item">
                                        <div className="admin-item-content">
                                            <span>{dir.name} ({dir.email})</span>
                                            <small>{dir.location}</small>
                                        </div>
                                        <div className="admin-item-actions"><button onClick={() => setDirectors(p => p.filter(d => d.email !== dir.email))} className="button danger small-btn">Remove</button></div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <form onSubmit={handleAddDirector} className="admin-form">
                            <input type="text" placeholder="Host full name" value={newDirectorName} onChange={e => setNewDirectorName(e.target.value)} required />
                            <input type="email" placeholder="Host email" value={newDirectorEmail} onChange={e => setNewDirectorEmail(e.target.value)} required />
                            <select value={newDirectorLocation} onChange={e => setNewDirectorLocation(e.target.value)} required disabled={branches.length === 0}>
                                <option value="">Select branch</option>
                                {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                            </select>
                            <button type="submit" className="button primary" disabled={branches.length === 0}>Add Host</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Notification: React.FC<{
    message: string;
    details?: string;
    type: 'success' | 'error';
    onClose: () => void;
}> = ({ message, details, type, onClose }) => {
    const className = type === 'success' ? 'global-sync-success' : 'global-sync-error';
    return (
        <div className={className}>
            <div className="error-main">
                <span>{message}</span>
                <button className="close-button" onClick={onClose} aria-label="Close notification">&times;</button>
            </div>
            {details && (
                <details className="error-details"><summary>Show details</summary><pre>{details}</pre></details>
            )}
        </div>
    );
};

const MemoizedNotification = React.memo(Notification);


const OcrSection: React.FC<{
    onOcrComplete: (data: OcrData) => void;
}> = ({ onOcrComplete }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        return () => { // Cleanup on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        const setupCamera = async () => {
            if (isCameraOn && videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    streamRef.current = stream;
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                } catch (err) {
                    console.error("Camera Error:", err);
                    setError("Could not access camera. Please check permissions.");
                    setIsCameraOn(false);
                }
            } else if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
        setupCamera();
    }, [isCameraOn]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    setImageSrc(event.target.result);
                    setError(null);
                    setIsCameraOn(false);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const startCamera = () => {
        setImageSrc(null);
        setError(null);
        setIsCameraOn(true);
    };
    
    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setImageSrc(canvas.toDataURL('image/jpeg'));
            setIsCameraOn(false);
        }
    };

    const runVisitorOcr = useCallback(async () => {
        if (!ai) {
            setError("OCR is disabled: API key not configured.");
            return;
        }
        if (!imageSrc) {
            setError("Please upload or capture an image first.");
            return;
        }
        setIsOcrLoading(true);
        setError(null);

        try {
            const resizedImageSrc = await resizeImage(imageSrc, 1280, 1280);
            const base64Data = resizedImageSrc.split(',')[1];
            if (!base64Data) throw new Error("Could not extract base64 data from the image.");
            
            const systemInstruction = "You are an expert AI assistant for OCR on business cards/IDs. Extract contact information accurately. Do not invent details. Return null for fields not found.";
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Data } }] },
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            fullName: { type: Type.STRING, description: "Person's full name." },
                            email: { type: Type.STRING, description: "Primary email address." },
                            mobileNumber: { type: Type.STRING, description: "Mobile phone number." },
                            company: { type: Type.STRING, description: "Company/organization name." },
                            designation: { type: Type.STRING, description: "Job title or role." },
                        }
                    },
                    safetySettings: [{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE }, { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE }, { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }, { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }]
                }
            });

            if (!response.text) {
                const blockReason = response.promptFeedback?.blockReason;
                throw new Error(blockReason ? `Request blocked by safety filters: ${blockReason}` : "Received an empty response from the AI.");
            }

            const parsedData: OcrData = JSON.parse(response.text);
            if (!Object.values(parsedData).some(v => v)) {
                throw new Error("The AI could not find any recognizable information on the card.");
            }
            onOcrComplete(parsedData);

        } catch (err) {
            console.error("OCR failed:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            if (message.includes("safety filters")) setError("Extraction failed: The image was blocked by content safety filters.");
            else if (message.includes("recognizable information")) setError("No information could be extracted. Please try a clearer photo.");
            else setError("An error occurred during AI data extraction. Please try again.");
        } finally {
            setIsOcrLoading(false);
        }
    }, [imageSrc, onOcrComplete]);

    return (
        <div className="card ocr-section">
            <h3>ID/Card OCR</h3>
            <div className="button-group">
                <label className="button secondary">Upload Image<input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} /></label>
                <button className="button secondary" onClick={isCameraOn ? () => setIsCameraOn(false) : startCamera}>{isCameraOn ? 'Close Camera' : 'Use Camera'}</button>
            </div>
            {isCameraOn && <div className="camera-preview"><video ref={videoRef} autoPlay playsInline muted /><button className="button primary" onClick={captureImage}>Capture</button></div>}
            {imageSrc && !isCameraOn && (
                <div className="image-preview">
                    <img src={imageSrc} alt="ID/Business Card Preview" />
                    <button className="button primary ocr-button" onClick={runVisitorOcr} disabled={isOcrLoading}>{isOcrLoading ? 'Extracting...' : 'Extract Data'}</button>
                </div>
            )}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

const MemoizedOcrSection = React.memo(OcrSection);


const VisitorForm: React.FC<{
    formData: Omit<Visitor, 'id' | 'checkInTime' | 'synced'> & { otherPurposeDetail: string };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    branches: Branch[];
    directors: Director[];
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
    locationStatus: string;
}> = ({ formData, setFormData, branches, directors, isSubmitting, onSubmit, locationStatus }) => {
    const [errors, setErrors] = useState<FormErrors>({});

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => {
            const newState = { ...prev, [name]: value };
            if (name === 'branchLocation') newState.host = ''; // Reset host when branch changes
            return newState;
        });
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors, setFormData]);

    const validateForm = useCallback(() => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
        if (!formData.host) newErrors.host = "Host is required.";
        if (!formData.branchLocation) newErrors.branchLocation = "Branch location is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(e);
        }
    }, [validateForm, onSubmit]);

    const filteredDirectors = useMemo(() =>
        directors.filter(d => d.location === formData.branchLocation),
        [directors, formData.branchLocation]
    );

    return (
        <form onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isSubmitting} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="form-group"><label htmlFor="name">Full Name</label><input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required aria-invalid={!!errors.name} />{errors.name && <p className="error-message">{errors.name}</p>}</div>
                <div className="form-group"><label htmlFor="email">Email Address</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required aria-invalid={!!errors.email} />{errors.email && <p className="error-message">{errors.email}</p>}</div>
                <div className="form-group"><label htmlFor="mobileNumber">Mobile Number</label><input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} /></div>
                <div className="form-group"><label htmlFor="company">Company</label><input type="text" id="company" name="company" value={formData.company} onChange={handleInputChange} /></div>
                <div className="form-group"><label htmlFor="designation">Designation</label><input type="text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange} /></div>
                <div className="form-group"><label htmlFor="branchLocation">Branch Location</label><select id="branchLocation" name="branchLocation" value={formData.branchLocation} onChange={handleInputChange} required aria-invalid={!!errors.branchLocation}><option value="">Select a Branch</option>{branches.map(branch => (<option key={branch.name} value={branch.name}>{branch.name}</option>))}</select><p className="location-status">{locationStatus}</p>{errors.branchLocation && <p className="error-message">{errors.branchLocation}</p>}</div>
                <div className="form-group"><label htmlFor="purpose">Purpose of Visit</label><select id="purpose" name="purpose" value={formData.purpose} onChange={handleInputChange}>{AppConfig.PURPOSE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}</select>{formData.purpose === 'Other' && (<input type="text" name="otherPurposeDetail" placeholder="Please specify" value={formData.otherPurposeDetail} onChange={handleInputChange} style={{ marginTop: '10px' }} required />)}</div>
                <div className="form-group"><label htmlFor="host">Host</label><select id="host" name="host" value={formData.host} onChange={handleInputChange} required aria-invalid={!!errors.host} disabled={!formData.branchLocation}><option value="">Select a Host</option>{filteredDirectors.map(dir => (<option key={dir.email} value={dir.name}>{dir.name}</option>))}</select>{!formData.branchLocation && <p className="form-info-message">Please select a branch location to see available hosts.</p>}{errors.host && <p className="error-message">{errors.host}</p>}</div>
                <button type="submit" className="button primary full-width">{isSubmitting ? 'Checking In...' : 'Check-In'}</button>
            </fieldset>
        </form>
    );
};

const MemoizedVisitorForm = React.memo(VisitorForm);


const RecentVisitors: React.FC<{
    visitors: Visitor[];
    selectedBranch: string;
    onRetrySync: (visitor: Visitor) => void;
}> = ({ visitors, selectedBranch, onRetrySync }) => {
    
    const filteredVisitors = useMemo(() =>
        selectedBranch
            ? visitors.filter(v => v.branchLocation === selectedBranch).slice(0, 2)
            : visitors.slice(0, 2),
        [visitors, selectedBranch]
    );

    return (
        <div className="card visitor-list-section">
            <h2>{selectedBranch ? `Recent Visitors at ${selectedBranch}` : 'Recent Visitors'}</h2>
            {filteredVisitors.length > 0 ? (
                <ul className="visitor-list">
                    {filteredVisitors.map(visitor => (
                        <li key={visitor.id} className="visitor-item card">
                            <div className="visitor-details">
                                <h3>{visitor.name}</h3>
                                <p><strong>Email:</strong> {visitor.email}</p>
                                {visitor.company && <p><strong>Company:</strong> {visitor.company}</p>}
                                <p><strong>Purpose:</strong> {visitor.purpose}</p>
                                <p><strong>Host:</strong> {visitor.host}</p>
                                <p><strong>Checked In:</strong> {new Date(visitor.checkInTime).toLocaleString()}</p>
                            </div>
                            <div className="visitor-actions">
                                <div className="sync-status">
                                    {visitor.synced === 'syncing' && 'Syncing...'}
                                    {visitor.synced === 'success' && 'Synced ✅'}
                                    {visitor.synced === 'failed' && 'Sync Failed ❌'}
                                </div>
                                {visitor.synced === 'failed' && (
                                    <button className="button secondary retry-button" onClick={() => onRetrySync(visitor)}>Retry Sync</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-visitors-message">{selectedBranch ? `No recent visitors for ${selectedBranch}.` : 'Select a branch to see recent visitors.'}</p>
            )}
        </div>
    );
};

const MemoizedRecentVisitors = React.memo(RecentVisitors);

const AppHeader: React.FC<{ onOpenAdmin: () => void }> = ({ onOpenAdmin }) => {
  return (
    <header>
      <h1>Visitor Management System</h1>
      <button className="settings-icon-button" onClick={onOpenAdmin} aria-label="Open Admin Dashboard">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>
    </header>
  );
};
const MemoizedAppHeader = React.memo(AppHeader);


// --- MAIN APP COMPONENT ---

const App = () => {
    // Primary State
    const [visitors, setVisitors] = useState<Visitor[]>(() => getInitialState('visitors', []));
    const [branches, setBranches] = useState<Branch[]>(() => getInitialState('branches', AppConfig.DEFAULT_BRANCHES));
    const [directors, setDirectors] = useState<Director[]>(() => getInitialState('directors', AppConfig.DEFAULT_DIRECTORS).sort((a,b) => a.name.localeCompare(b.name)));
    const [formData, setFormData] = useState({
        name: '', email: '', company: '', designation: '', mobileNumber: '',
        purpose: AppConfig.PURPOSE_OPTIONS[0], otherPurposeDetail: '', host: '', branchLocation: ''
    });

    // UI/Flow State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalSyncError, setGlobalSyncError] = useState<{ message: string; details?: string } | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [locationStatus, setLocationStatus] = useState('Initializing location...');
    const [settingsStatus, setSettingsStatus] = useState('Loading settings...');
    const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Save state to localStorage
    useEffect(() => { localStorage.setItem('visitors', JSON.stringify(visitors)); }, [visitors]);
    useEffect(() => { localStorage.setItem('branches', JSON.stringify(branches)); }, [branches]);
    useEffect(() => { localStorage.setItem('directors', JSON.stringify(directors)); }, [directors]);

    // Load Google Maps script on component mount
    useEffect(() => {
        loadGoogleMapsScript();
    }, []);


    // Fetch settings from Google Sheets
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(AppConfig.GOOGLE_SHEET_URL);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const settings = await response.json();
                if (settings.error) throw new Error(`Apps Script Error: ${settings.error}`);

                if (Array.isArray(settings.branches) && settings.branches.length > 0) setBranches(settings.branches);
                if (Array.isArray(settings.directors) && settings.directors.length > 0) setDirectors(settings.directors.sort((a: Director, b: Director) => a.name.localeCompare(b.name)));
                
                setSettingsStatus("Settings loaded successfully.");
                setGlobalSyncError(null);
            } catch (e: any) {
                console.error("Error fetching settings from Google Sheets:", e);
                setSettingsStatus("Could not load remote settings. Using local data.");
                setGlobalSyncError({ message: "Could not load settings from Google Sheets.", details: e.message });
            }
        };
        fetchSettings();
    }, []);

    const findNearestBranch = useCallback((lat: number, lon: number) => {
        let closestBranch: Branch | null = null;
        let minDistance = Infinity;
        branches.forEach(branch => {
            const distance = Math.sqrt(Math.pow(branch.lat - lat, 2) + Math.pow(branch.lon - lon, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestBranch = branch;
            }
        });
        return closestBranch;
    }, [branches]);

    // Geolocation logic
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus("Geolocation is not supported. Please select a branch manually.");
            return;
        }
        setLocationStatus("Attempting to find location...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                const fallbackToDistance = () => {
                    const nearest = findNearestBranch(latitude, longitude);
                    if (nearest) {
                        setFormData(prev => ({ ...prev, branchLocation: nearest.name }));
                        setLocationStatus(`Automatically set branch to ${nearest.name}.`);
                    } else {
                        setLocationStatus('Could not determine nearest branch. Please select manually.');
                    }
                };
                
                if (!window.google?.maps?.Geocoder) {
                    setLocationStatus("Google Maps unavailable. Using basic location detection.");
                    fallbackToDistance();
                    return;
                }
                
                const geocoder = new window.google.maps.Geocoder();
                setLocationStatus("Analyzing location with Google Maps...");
                geocoder.geocode({ location: new window.google.maps.LatLng(latitude, longitude) }, (results, status) => {
                    if (status === 'OK' && results?.[0]) {
                        const formattedAddress = results[0].formatted_address;
                        const matchedBranch = branches.find(b => formattedAddress.toLowerCase().includes(b.name.toLowerCase()));
                        if (matchedBranch) {
                            setFormData(prev => ({ ...prev, branchLocation: matchedBranch.name }));
                            setLocationStatus(`Automatically set branch to ${matchedBranch.name} via Google Maps.`);
                            return;
                        }
                    }
                    setLocationStatus("Address match failed. Using nearest location.");
                    fallbackToDistance();
                });
            },
            () => { setLocationStatus('Could not get location. Please check permissions and select manually.'); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, [findNearestBranch, branches]);

    const syncWithGoogleSheet = useCallback(async (visitor: Visitor) => {
        try {
            updateVisitorSyncStatus(visitor.id, 'syncing');
            const hostDirector = directors.find(d => d.name === visitor.host);
            const dataToSync = { ...visitor, hostEmail: hostDirector?.email || '' };
            delete (dataToSync as any).synced;

            const params = new URLSearchParams({ payload: JSON.stringify(dataToSync) });
            const response = await fetch(AppConfig.GOOGLE_SHEET_URL, { method: 'POST', body: params });
            const result = await response.json();

            if (result.status === 'success') {
                updateVisitorSyncStatus(visitor.id, 'success');
                setSuccessMessage('Data synced with Google Sheets! ✅');
                setTimeout(() => setSuccessMessage(null), 4000);
            } else {
                throw new Error(result.message || 'Unknown error from Google Apps Script.');
            }
        } catch (error: any) {
             console.error('Sync failed:', error);
             updateVisitorSyncStatus(visitor.id, 'failed');
             setGlobalSyncError({ message: `Sync failed for ${visitor.name}.`, details: `Error: ${error.message}. Data is saved locally.` });
        }
    }, [directors]);

    const updateVisitorSyncStatus = (id: string, status: 'syncing' | 'success' | 'failed') => {
        setVisitors(prev => prev.map(v => v.id === id ? { ...v, synced: status } : v));
    };

    const handleCheckIn = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const newVisitor: Visitor = {
                id: new Date().toISOString(),
                ...formData,
                purpose: formData.purpose === 'Other' ? formData.otherPurposeDetail : formData.purpose,
                checkInTime: new Date(),
                synced: 'syncing'
            };
            setVisitors(prev => [newVisitor, ...prev]);
            await syncWithGoogleSheet(newVisitor);
            setFormData({
                name: '', email: '', company: '', designation: '', mobileNumber: '',
                purpose: AppConfig.PURPOSE_OPTIONS[0], otherPurposeDetail: '', host: '',
                branchLocation: formData.branchLocation // Keep branch location
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, formData, syncWithGoogleSheet]);

    const handleOcrComplete = useCallback((ocrData: OcrData) => {
        setFormData(prev => ({
            ...prev,
            name: ocrData.fullName || prev.name,
            email: ocrData.email || prev.email,
            mobileNumber: ocrData.mobileNumber || prev.mobileNumber,
            company: ocrData.company || prev.company,
            designation: ocrData.designation || prev.designation,
        }));
    }, []);

    const handleOpenAdmin = useCallback(() => setIsPasswordModalOpen(true), []);
    const handlePasswordSuccess = useCallback(() => {
        setIsPasswordModalOpen(false);
        setIsAdminDashboardOpen(true);
    }, []);

    return (
        <div className="container">
            <MemoizedAppHeader onOpenAdmin={handleOpenAdmin} />
            
            {isPasswordModalOpen && <PasswordModal onClose={() => setIsPasswordModalOpen(false)} onSuccess={handlePasswordSuccess} />}
            {isAdminDashboardOpen && <AdminDashboard isOpen={isAdminDashboardOpen} onClose={() => setIsAdminDashboardOpen(false)} branches={branches} setBranches={setBranches} directors={directors} setDirectors={setDirectors} />}

            {successMessage && <MemoizedNotification type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
            {globalSyncError && <MemoizedNotification type="error" {...globalSyncError} onClose={() => setGlobalSyncError(null)} />}

            <div className="card form-section">
                <h2>Visitor Check-In</h2>
                <MemoizedOcrSection onOcrComplete={handleOcrComplete} />
                <MemoizedVisitorForm
                    formData={formData}
                    setFormData={setFormData}
                    branches={branches}
                    directors={directors}
                    isSubmitting={isSubmitting}
                    onSubmit={handleCheckIn}
                    locationStatus={locationStatus}
                />
            </div>

            <MemoizedRecentVisitors
                visitors={visitors}
                selectedBranch={formData.branchLocation}
                onRetrySync={syncWithGoogleSheet}
            />
        </div>
    );
};


// --- RENDER APP ---
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<React.StrictMode><App /></React.StrictMode>);
}