import { Hero } from "@/components/Hero"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "About",
  description: "Learn more about Real Growth Labs and our mission to help creators monetize their knowledge.",
}

const timeline = [
  {
    year: "2020",
    title: "Founded",
    description: "Real Growth Labs was born from the frustration of complex book creation tools.",
  },
  {
    year: "2021",
    title: "First AI Engine",
    description: "Launched our first AI-powered book generation engine.",
  },
  {
    year: "2022",
    title: "Audiobook Feature",
    description: "Introduced 1-click audiobook generation, revolutionizing content creation.",
  },
  {
    year: "2023",
    title: "10,000+ Creators",
    description: "Reached a milestone of 10,000 creators using our platform.",
  },
  {
    year: "2024",
    title: "Today",
    description: "Continuing to innovate and help creators monetize their knowledge.",
  },
]

const founders = [
  {
    name: "Alex Thompson",
    role: "Co-Founder & CEO",
    bio: "Serial entrepreneur with 15+ years in content creation and AI technology.",
  },
  {
    name: "Sarah Martinez",
    role: "Co-Founder & CTO",
    bio: "AI researcher and engineer passionate about making technology accessible.",
  },
  {
    name: "Michael Chen",
    role: "Co-Founder & Head of Product",
    bio: "Product strategist focused on creator tools and user experience.",
  },
]

export default function AboutPage() {
  return (
    <>
      <Hero
        title={
          <>
            About{" "}
            <span className="text-[#a6261c]">Real Growth Labs</span>
          </>
        }
        subtitle="We're on a mission to help creators turn their knowledge into books, lead magnets, and audiobooks."
      />
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              At Real Growth Labs, we believe that every creator deserves access to powerful tools
              that can help them monetize their knowledge. We&apos;ve built a platform that combines
              cutting-edge AI technology with practical features to help you create, publish, and
              monetize your expertise.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Real Growth Labs?</h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="text-[#a6261c] mr-2 font-bold">•</span>
                <span>We understand creators because we are creators ourselves</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#a6261c] mr-2 font-bold">•</span>
                <span>AI-powered tools that actually work and save you time</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#a6261c] mr-2 font-bold">•</span>
                <span>Complete solution from creation to monetization</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#a6261c] mr-2 font-bold">•</span>
                <span>Continuous innovation based on creator feedback</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Journey
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={item.year} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-[#a6261c] rounded-full flex items-center justify-center text-white font-bold">
                      {item.year}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet the Founders
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {founders.map((founder) => (
              <Card key={founder.name} className="text-center border-gray-100">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{founder.name}</h3>
                  <p className="text-[#a6261c] font-medium mb-3">{founder.role}</p>
                  <p className="text-sm text-gray-600">{founder.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
