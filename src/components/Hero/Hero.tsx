import { useSpring, animated, useTrail, config } from '@react-spring/web'
import { Button } from '../Button'
import TransparentLogo from '../../assets/images/transparent-logo.png'

import DashCardsBg from '../../assets/images/groupofdash.png'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

// import { Text } from '../Text'

const stats = [
  { value: '1k+', label: 'Happy Users' },
  { value: '10+', label: 'Partners' },
  { value: '2.6k+', label: 'Gift Cards Sent' },
]

export default function Hero() {
  const navigate = useNavigate()

  // Badge animation
  const badgeSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    delay: 200,
    config: config.gentle,
  })

  // Main heading animation
  const headingSpring = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    delay: 400,
    config: config.slow,
  })

  // Subtitle animation
  const subtitleSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 600,
    config: config.gentle,
  })

  // Stats trail animation
  const [statsTrail] = useTrail(stats.length, () => ({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay: 800,
    config: config.gentle,
  }))

  // Buttons animation
  const buttonsSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 1000,
    config: config.gentle,
  })

  // Background image animation
  const imageSpring = useSpring({
    from: { opacity: 0, scale: 0.9, x: 50 },
    to: { opacity: 1, scale: 1, x: 0 },
    delay: 300,
    config: config.slow,
  })

  // Transparent logo floating animation
  const logoSpring = useSpring({
    from: { opacity: 0.1, y: 0 },
    to: async (next) => {
      while (true) {
        await next({ opacity: 0.2, y: -10 })
        await next({ opacity: 0.1, y: 0 })
      }
    },
    config: { duration: 3000 },
  })

  return (
    <header className="bg-primary-500 flex pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
      <section className="flex flex-col lg:flex-row justify-between items-center wrapper max-md:px-2 py-0 md:py-6 lg:py-8">
        <div className="text-white relative flex flex-col w-full lg:w-auto z-20 md:py-6 lg:py-8">
          {/* Transparent Logo - Background image behind text */}
          <animated.img
            src={TransparentLogo}
            alt="Transparent Logo"
            className="absolute top-4 md:top-6 lg:top-10 left-0 md:left-4 lg:left-0 z-0 w-32 md:w-40 lg:w-48 h-auto"
            style={{
              opacity: logoSpring.opacity,
              transform: logoSpring.y.to((y) => `translateY(${y}px)`),
            }}
          />
          <div className="flex flex-col gap-3 md:gap-5 lg:gap-6 px-2 md:px-6 lg:px-10 md:py-6 lg:py-8 relative z-10">
            <animated.p
              style={badgeSpring}
              className="w-fit max-w-full text-[11px] md:text-sm font-medium text-white bg-[#ffffff26] border border-white/20 py-1 px-3 md:py-2 md:px-5 rounded-[50px] leading-snug"
            >
              <span className="md:hidden">🎁 Ghana&apos;s #1 gifting platform</span>
              <span className="hidden md:inline">
                🎁 Ghana&apos;s Leading Digital Gifting Platform
              </span>
            </animated.p>
            <div className="max-w-[636px] w-full flex flex-col gap-4 md:gap-8 lg:gap-12">
              <animated.p
                style={headingSpring}
                className="text-[1.65rem] leading-[1.15] md:text-4xl lg:text-5xl xl:text-[64px] font-bold uppercase tracking-tight md:-tracking-[3%] md:leading-[1.1] lg:leading-[72px]"
              >
                Gift Cards for the people that matter most in your life
              </animated.p>
              <animated.p
                style={subtitleSpring}
                className="text-sm leading-snug md:text-xl lg:text-2xl xl:text-[28px] font-light md:leading-[1.4] lg:leading-[39px] max-w-full lg:max-w-[548px] w-full"
              >
                Welcome to DashQard!{' '}
                <span className="text-yellow-500 font-bold">Create, Connect. Celebrate.</span>
              </animated.p>
              <section className="flex justify-between gap-2 md:flex-wrap md:justify-start md:gap-6 lg:gap-8 max-w-sm md:max-w-none">
                {statsTrail.map((style, index) => (
                  <animated.div key={index} style={style} className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xl md:text-3xl lg:text-[32px] font-bold leading-tight text-yellow-500">
                      {stats[index].value}
                    </p>
                    <p className="text-[10px] md:text-sm font-light leading-tight">
                      {stats[index].label}
                    </p>
                  </animated.div>
                ))}
              </section>
              <animated.div
                style={buttonsSpring}
                className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1"
              >
                <Button
                  variant="primary"
                  size="medium"
                  className="rounded-full! w-full sm:w-auto sm:min-w-[210px] min-h-12 px-6 text-sm! md:text-base! font-semibold! shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 transition-all duration-200"
                  icon="mdi:arrow-right"
                  iconPosition="right"
                  onClick={() => navigate(ROUTES.IN_APP.AUTH.REGISTER)}
                  iconProps={{ className: 'size-5' }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="medium"
                  icon="bi:gift"
                  iconPosition="left"
                  onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                  className="rounded-full! w-full sm:w-auto sm:min-w-[210px] min-h-12 px-6 text-sm! md:text-base! font-semibold! !border-2 !border-white/80 !text-white !bg-white/10 hover:!bg-white hover:!text-primary-500 hover:!border-white hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm"
                  iconProps={{ className: 'size-4' }}
                >
                  Get a Card
                </Button>
              </animated.div>
            </div>
          </div>
        </div>
        <animated.div
          className="hidden lg:block shrink-0 w-full lg:w-auto mt-8 lg:mt-0 relative z-10"
          style={{
            opacity: imageSpring.opacity,
            transform:
              imageSpring.scale.to((s) => `scale(${s})`) +
              ' ' +
              imageSpring.x.to((x) => `translateX(${x}px)`),
          }}
        >
          <img
            src={DashCardsBg}
            alt="DashCardsBg"
            className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto lg:mx-0 h-auto object-contain"
          />
        </animated.div>
      </section>
    </header>
  )
}
