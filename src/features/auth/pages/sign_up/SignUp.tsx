import { SignUpForm, SignUpMarketingPanel } from '../../components'

export default function SignUp() {
  return (
    <section className="relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-white pb-6 pt-0 sm:pb-8 lg:min-h-0 lg:bg-linear-to-br lg:from-white lg:to-[#f8f9ff] lg:justify-center lg:px-8 lg:py-12 lg:pt-12">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute -right-[5%] top-[10%] hidden h-[300px] w-[300px] rounded-full bg-primary-500 opacity-5 animate-[signup-float_8s_ease-in-out_infinite] md:block" />
        <div className="absolute -left-[5%] bottom-[10%] hidden h-[200px] w-[200px] rounded-full bg-[#4a9eff] opacity-5 animate-[signup-float_8s_ease-in-out_infinite_2s] md:block" />
      </div>

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col lg:justify-center">
        <div className="grid w-full min-w-0 flex-1 items-stretch gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div
            data-testid="signup-marketing"
            className="hidden min-w-0 lg:block lg:col-span-6 xl:col-span-7"
          >
            <SignUpMarketingPanel />
          </div>
          <div className="flex w-full min-w-0 flex-1 flex-col lg:col-span-6 lg:flex-none lg:justify-end xl:col-span-5 xl:col-start-8">
            <SignUpForm />
          </div>
        </div>
      </div>
    </section>
  )
}
