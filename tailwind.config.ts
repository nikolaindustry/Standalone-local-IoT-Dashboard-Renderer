
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-down': {
					'0%': {
						transform: 'translateY(-20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-left': {
					'0%': {
						transform: 'translateX(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-right': {
					'0%': {
						transform: 'translateX(-20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.8)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0.8)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.05)'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'flip-in': {
					'0%': {
						transform: 'rotateY(90deg)',
						opacity: '0'
					},
					'100%': {
						transform: 'rotateY(0)',
						opacity: '1'
					}
				},
				'rotate-in': {
					'0%': {
						transform: 'rotate(-180deg) scale(0.8)',
						opacity: '0'
					},
					'100%': {
						transform: 'rotate(0) scale(1)',
						opacity: '1'
					}
				},
				'pulse': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.5'
					}
				},
				'bounce': {
					'0%, 100%': {
						transform: 'translateY(-25%)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
				},
				'wobble': {
					'0%, 100%': { transform: 'translateX(0%) rotate(0deg)' },
					'15%': { transform: 'translateX(-25%) rotate(-5deg)' },
					'30%': { transform: 'translateX(20%) rotate(3deg)' },
					'45%': { transform: 'translateX(-15%) rotate(-3deg)' },
					'60%': { transform: 'translateX(10%) rotate(2deg)' },
					'75%': { transform: 'translateX(-5%) rotate(-1deg)' }
				},
				'swing': {
					'20%': { transform: 'rotate(15deg)' },
					'40%': { transform: 'rotate(-10deg)' },
					'60%': { transform: 'rotate(5deg)' },
					'80%': { transform: 'rotate(-5deg)' },
					'100%': { transform: 'rotate(0deg)' }
				},
				'tada': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)' },
					'10%, 20%': { transform: 'scale(0.9) rotate(-3deg)' },
					'30%, 50%, 70%, 90%': { transform: 'scale(1.1) rotate(3deg)' },
					'40%, 60%, 80%': { transform: 'scale(1.1) rotate(-3deg)' }
				},
				'jello': {
					'0%, 100%': { transform: 'skewX(0deg) skewY(0deg)' },
					'30%': { transform: 'skewX(25deg) skewY(25deg)' },
					'40%': { transform: 'skewX(-15deg) skewY(-15deg)' },
					'50%': { transform: 'skewX(15deg) skewY(15deg)' },
					'65%': { transform: 'skewX(-5deg) skewY(-5deg)' },
					'75%': { transform: 'skewX(5deg) skewY(5deg)' }
				},
				'flash': {
					'0%, 50%, 100%': { opacity: '1' },
					'25%, 75%': { opacity: '0' }
				},
				'rubber-band': {
					'0%, 100%': { transform: 'scale(1)' },
					'30%': { transform: 'scaleX(1.25) scaleY(0.75)' },
					'40%': { transform: 'scaleX(0.75) scaleY(1.25)' },
					'50%': { transform: 'scaleX(1.15) scaleY(0.85)' },
					'65%': { transform: 'scaleX(0.95) scaleY(1.05)' },
					'75%': { transform: 'scaleX(1.05) scaleY(0.95)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(5deg)' },
					'75%': { transform: 'rotate(-5deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'slide-down': 'slide-down 0.5s ease-out forwards',
				'slide-left': 'slide-left 0.5s ease-out forwards',
				'slide-right': 'slide-right 0.5s ease-out forwards',
				'scale-in': 'scale-in 0.5s ease-out forwards',
				'bounce-in': 'bounce-in 0.6s ease-out forwards',
				'flip-in': 'flip-in 0.6s ease-out forwards',
				'rotate-in': 'rotate-in 0.6s ease-out forwards',
				'pulse': 'pulse 2s ease-in-out infinite',
				'bounce': 'bounce 1s infinite',
				'shake': 'shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
				'wobble': 'wobble 1s ease-in-out',
				'swing': 'swing 1s ease-in-out',
				'tada': 'tada 1s ease-in-out',
				'jello': 'jello 1s ease-in-out',
				'flash': 'flash 1s ease-in-out infinite',
				'rubber-band': 'rubber-band 1s ease-in-out',
				'wiggle': 'wiggle 1s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
