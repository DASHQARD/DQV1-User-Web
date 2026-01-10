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
    <header className="bg-primary-500 lg:min-h-screen flex pt-8 md:pt-16 lg:pt-20 overflow-hidden">
      <section className="flex flex-col lg:flex-row justify-between items-center wrapper py-2 md:py-6 lg:py-8">
        <div className="text-white py-2 md:py-6 lg:py-8 relative flex flex-col gap-6 md:gap-8 lg:gap-10 w-full lg:w-auto z-20">
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
          <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 px-4 md:px-6 lg:px-10 py-2 md:py-6 lg:py-8 relative z-10">
            <animated.p
              style={badgeSpring}
              className="w-fit text-xs md:text-sm font-medium text-white bg-[#ffffff26] border border-white/20 py-1.5 md:py-2 px-4 md:px-5 rounded-[50px]"
            >
              🎁 Ghana's Leading Digital Gifting Platform
            </animated.p>
            <div className="max-w-[636px] w-full flex flex-col gap-6 md:gap-8 lg:gap-12">
              <animated.p
                style={headingSpring}
                className="text-3xl md:text-4xl lg:text-5xl xl:text-[64px] font-bold uppercase -tracking-[2%] md:-tracking-[3%] leading-tight md:leading-[1.1] lg:leading-[72px]"
              >
                Gift Cards for the people that matter most in your life
              </animated.p>
              <animated.p
                style={subtitleSpring}
                className="text-base md:text-xl lg:text-2xl xl:text-[28px] font-light leading-relaxed md:leading-[1.4] lg:leading-[39px] max-w-full lg:max-w-[548px] w-full"
              >
                Welcome to DashQard!{' '}
                <span className="text-yellow-500 font-bold">Create, Connect. Celebrate.</span>
              </animated.p>
              <section className="flex flex-wrap gap-4 md:gap-6 lg:gap-8">
                {statsTrail.map((style, index) => (
                  <animated.div key={index} style={style} className="flex flex-col gap-1">
                    <p className="text-2xl md:text-3xl lg:text-[32px] font-bold leading-tight md:leading-[32px] text-yellow-500">
                      {stats[index].value}
                    </p>
                    <p className="text-xs md:text-sm font-light">{stats[index].label}</p>
                  </animated.div>
                ))}
              </section>
              <animated.div
                style={buttonsSpring}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto"
              >
                <Button
                  className="rounded-4xl! w-full sm:max-w-[220px] sm:w-full"
                  icon="mdi:arrow-right-thin"
                  iconPosition="right"
                  iconProps={{ className: 'size-4 md:size-5 text-primary-500' }}
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                  className="rounded-4xl! w-full sm:max-w-[220px] sm:w-full"
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
