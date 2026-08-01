import { useSpring, animated, config } from '@react-spring/web'
import { Button } from '../Button'
import TransparentLogo from '../../assets/images/transparent-logo.png'

import HeroImage from '../../assets/images/hero-image.png'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

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

  // Buttons animation
  const buttonsSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 800,
    config: config.gentle,
  })

  // Background image animation
  const imageSpring = useSpring({
    from: { opacity: 0, x: 50 },
    to: { opacity: 1, x: 0 },
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
    <header className="bg-primary-500 relative flex overflow-hidden pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-0">
      <section className="wrapper flex w-full flex-col items-center justify-between max-md:px-2 py-0 md:py-6 lg:flex-row lg:items-end lg:py-0 lg:pt-8">
        <div className="relative z-20 flex w-full flex-col text-white md:py-6 lg:w-auto lg:self-center lg:py-8 lg:pb-16 xl:pb-20">
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
          <div className="relative z-10 flex flex-col gap-3 px-2 md:gap-5 md:px-6 md:py-6 lg:gap-6 lg:px-10 lg:py-8">
            <animated.p
              style={badgeSpring}
              className="w-fit max-w-full rounded-[50px] border border-white/20 bg-[#ffffff26] px-3 py-1 text-[11px] font-medium leading-snug text-white md:px-5 md:py-2 md:text-sm"
            >
              <span className="md:hidden">Ghana&apos;s #1 gifting platform</span>
              <span className="hidden md:inline">
                Ghana&apos;s Leading Digital Gifting Platform
              </span>
            </animated.p>
            <div className="flex w-full max-w-[636px] flex-col gap-4 md:gap-8 lg:gap-12">
              <animated.p
                style={headingSpring}
                className="text-[1.65rem] font-bold uppercase leading-[1.15] tracking-tight md:-tracking-[3%] md:text-4xl md:leading-[1.1] lg:text-5xl lg:leading-[72px] xl:text-[64px]"
              >
                Gift Cards for the people that matter most in your life
              </animated.p>
              <animated.p
                style={subtitleSpring}
                className="w-full max-w-full text-sm font-light leading-snug md:text-xl md:leading-[1.4] lg:max-w-[548px] lg:text-2xl lg:leading-[39px] xl:text-[28px]"
              >
                Welcome to DashQard!{' '}
                <span className="font-bold text-yellow-500">Create, Connect. Celebrate.</span>
              </animated.p>
              <animated.div
                style={buttonsSpring}
                className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row"
              >
                <Button
                  variant="primary"
                  size="medium"
                  className="min-h-12 w-full rounded-full! px-6 text-sm! font-semibold! shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] sm:w-auto sm:min-w-[210px] md:text-base!"
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
                  className="min-h-12 w-full rounded-full! border-2! border-white/80! bg-white/10! px-6 text-sm! font-semibold! text-white! backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white! hover:bg-white! hover:text-primary-500! sm:w-auto sm:min-w-[210px] md:text-base!"
                  iconProps={{ className: 'size-4' }}
                >
                  Get a Card
                </Button>
              </animated.div>
            </div>
          </div>
        </div>
        <animated.div
          className="relative z-10 mt-8 hidden w-full shrink-0 self-end lg:mt-0 lg:block lg:w-[min(48%,42rem)] xl:w-[min(50%,48rem)]"
          style={{
            opacity: imageSpring.opacity,
            transform: imageSpring.x.to((x) => `translateX(${x}px)`),
          }}
        >
          <img
            src={HeroImage}
            alt="Man holding a DashPro gift card on a phone"
            className="mx-auto block h-auto w-full max-h-[min(72vh,640px)] object-contain object-bottom lg:mx-0 lg:max-h-[min(78vh,720px)] xl:max-h-[min(82vh,800px)]"
          />
        </animated.div>
      </section>
    </header>
  )
}
