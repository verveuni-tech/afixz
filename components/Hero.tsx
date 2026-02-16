import React from 'react'
import Button from './Button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const Hero: React.FC = () => {
  return (
    <section className="relative bg-[--color-background] pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden">

      {/* Soft Background Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-center">

          {/* LEFT SIDE */}
          <div className="max-w-3xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Now available in your city
            </div>

            {/* Heading (2 lines max) */}
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-slate-900 leading-[1.05] mb-6">
  Trusted Local Services{' '}
  <span className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent whitespace-nowrap">
    Made Simple.
  </span>
</h1>



            {/* Subtext */}
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              Discover reliable professionals for your home needs. From quick repairs to major installations, we connect you with the best.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button size="lg" className="group">
                Explore Services
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button variant="outline" size="lg">
                Get Early Access
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>Verified Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>Insured Work</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (Cleaner Modern Card Visual) */}
          <div className="relative hidden lg:flex justify-center">

            <div className="relative w-[420px] h-[420px]">

              {/* Main Card */}
              <div className="absolute inset-0 rounded-3xl border border-slate-200 bg-white shadow-xl p-8">

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Service</p>
                    <p className="font-semibold text-slate-900">Plumbing Repair</p>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    4.9 ★
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="h-12 rounded-lg bg-slate-100" />
                  <div className="h-12 rounded-lg bg-slate-100" />
                  <div className="h-12 rounded-lg bg-slate-100" />
                </div>

                <div className="mt-8">
                  <div className="h-12 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]" />
                </div>

              </div>

              {/* Floating Mini Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg px-5 py-3 border border-slate-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Booking Confirmed
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero
