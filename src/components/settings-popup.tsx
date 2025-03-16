import { FunctionComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect, useId, useRef } from 'preact/hooks';
import { catppuccin } from '../common/constants';

interface SettingsPopupProps {
    buttonText?: string;
    ribbonColor?: string;
    buttonColor?: string;
}

/** 
 * Settings contains a form given by users, displays a ribbon button in the top right corner of the slide,
 * it shows the children in an overlay when opened
 */
export const SettingsPopup: FunctionComponent<SettingsPopupProps> = ({
    buttonText = 'Interactif !',
    ribbonColor = '#4a90e2',
    buttonColor = 'white',
    children,
}) => {
    const isOpen = useSignal(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const id = useId();
    useEffect(() => {
        const dialog = dialogRef.current;
        const container = containerRef.current;
        if (!dialog) return;
        if (!container) return;

        if (isOpen.value) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            if (dialog.open) {
                // Add closing animation
                dialog.classList.add('closing');
                const timer = setTimeout(() => {
                    dialog.classList.remove('closing');
                    dialog.close();
                }, 300); // Match the transition duration
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen.value]);

    // Close dialog when clicking outside
    const handleBackdropClick = (e: MouseEvent) => {
        const dialogDimensions = containerRef.current?.getBoundingClientRect();
        if (
            dialogDimensions &&
            (e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom)
        ) {
            isOpen.value = false;
        }
    };

    useEffect(() => {
        if (isOpen.value) {
            dialogRef.current?.addEventListener('click', handleBackdropClick);
        }

        return () => {
            dialogRef.current?.removeEventListener('click', handleBackdropClick);
        };
    }, [isOpen.value]);

    return (
        <>
            {/* Ribbon with button */}
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    overflow: 'hidden',
                    width: '150px',
                    height: '150px',
                    zIndex: '999',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        transform: 'rotate(45deg) translate(35px, -15px)',
                    }}
                >
                    <button
                        onClick={() => { if (!children) return; isOpen.value = !isOpen.value; }}
                        style={{
                            backgroundColor: ribbonColor,
                            padding: '2px 30px',
                            border: 'none',
                            color: buttonColor,
                            fontSize: '16px',
                            lineHeight: '16px',
                            fontWeight: 'bold',
                            fontFamily: 'Poppins',
                            cursor: children ? 'cursor: url("images/cursor-hand.png"), auto' : 'unset',
                            outline: 'none',
                            transition: 'transform 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                            (e.target as HTMLElement).style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                            (e.target as HTMLElement).style.transform = 'scale(1)';
                        }}
                        aria-expanded={isOpen.value}
                        aria-controls={`ribbon-dialog-${id}`}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>

            {/* Dialog */}
            <dialog
                ref={dialogRef}
                id={`ribbon-dialog-${id}`}
                style={{
                    position: 'absolute',
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    border: 0,
                    inset: '0',
                    width: '100vw',
                    height: '100vh',
                    zIndex: '1000',
                }}
                onClose={() => { isOpen.value = false; }}
            >
                <div
                    ref={containerRef}
                    class="container"
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '25%',
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(4px)",
                        transform: "translateX(100%)",
                        transition: "transform 0.3s ease-in-out",
                    }}>
                    <button
                        onClick={() => { isOpen.value = false; }}
                        style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '48px',
                            padding: '10px',
                            lineHeight: '1',
                            color: catppuccin.text,
                        }}
                        aria-label="Close dialog"
                    >
                        ×
                    </button>
                    <div style={{ margin: "24px 10px" }} onClick={(event) => { event.stopPropagation(); event.stopImmediatePropagation(); }}>
                        {children}
                    </div>
                </div>
            </dialog>

            {/* Add global styles */}
            <style>
                {`
          .closing .container {
             transform: translateX(200%);
          } 
          dialog:not([open]) {
            display: none;
          }
          dialog:not([open]) .container{
            transform: translateX(200%);
          }
          dialog[open] .container{
            transform: translateX(0);
          }
        `}
            </style>
        </>
    );
};

