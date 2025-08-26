
import React from 'react';

interface SuccessAnimationProps {
    message?: string;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
    message = 'Opgeslagen!',
}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center w-full py-10 sm:py-12">
            <svg className="w-20 h-20" viewBox="0 0 100 100">
                <circle className="success-anim-circle" cx="50" cy="50" r="48" fill="#141ff5" />
                
                <path className="success-anim-check" fill="none" d="M30,55 L45,70 L75,40" />

                <g className="success-anim-burst">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(rotation => (
                        <path key={rotation} fill="none" d="M50,5 L50,15" transform={`rotate(${rotation} 50 50)`} />
                    ))}
                </g>
            </svg>
            <p className="text-lg font-bold mt-4 text-light-text-primary dark:text-dark-text-primary success-anim-text">
                {message}
            </p>
            <style>{`
                /* Animations */
                @keyframes scale-in { 
                    0% { transform: scale(0); } 
                    100% { transform: scale(1); } 
                }
                @keyframes draw-check { 
                    to { stroke-dashoffset: 0; } 
                }
                @keyframes burst-and-fade { 
                    0% { transform: scale(0.5); stroke-width: 4; opacity: 1; }
                    100% { transform: scale(1.2); stroke-width: 0; opacity: 0; }
                }
                @keyframes fade-in-up { 
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                
                /* Elements */
                .success-anim-circle {
                    animation: scale-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                .success-anim-check {
                    stroke-dasharray: 80;
                    stroke-dashoffset: 80;
                    stroke-width: 8;
                    stroke: white;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    animation: draw-check 0.4s 0.3s ease-out forwards;
                }
                .success-anim-burst path {
                    stroke-width: 4;
                    stroke: #141ff5;
                    stroke-linecap: round;
                    transform-origin: center;
                    opacity: 0;
                    animation: burst-and-fade 0.6s 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                }
                .success-anim-text {
                    opacity: 0;
                    animation: fade-in-up 0.5s 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default SuccessAnimation;
