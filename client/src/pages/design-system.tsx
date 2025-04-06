import { useState } from "react";
import { 
  PageContainer, 
  PageHeader, 
  PageContent 
} from "@/components/design-system/page-container";
import { 
  ATMFCard, 
  ATMFCardHeader, 
  ATMFCardBody, 
  ATMFCardFooter 
} from "@/components/design-system/atmf-card";
import { StatusBadge } from "@/components/design-system/status-badge";
import { ProgressBar } from "@/components/design-system/progress-bar";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { TabView } from "@/components/design-system/tab-view";
import { 
  BarChart3, 
  Download, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  BellRing,
  Settings,
  Zap
} from "lucide-react";

export default function DesignSystem() {
  const [activeTab, setActiveTab] = useState("colors");
  
  return (
    <PageContainer>
      <PageHeader 
        title="ATMosFera Design System" 
        description="A collection of UI components for the ATMF platform" 
      />
      
      <PageContent>
        <TabView
          tabs={[
            {
              id: "colors",
              label: "Colors",
              content: <ColorsSection />
            },
            {
              id: "components",
              label: "Components",
              content: <ComponentsSection />
            },
            {
              id: "utilities",
              label: "Utilities",
              content: <UtilitiesSection />
            }
          ]}
          defaultTab={activeTab}
          onChange={setActiveTab}
        />
      </PageContent>
    </PageContainer>
  );
}

function ColorsSection() {
  return (
    <div className="space-y-8">
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-semibold">Color Palette</h3>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Primary Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-[#0a1022] mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Background Main</p>
                    <p className="text-xs text-text-muted">#0a1022</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-[#050914] mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Background Dark</p>
                    <p className="text-xs text-text-muted">#050914</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-[#0e1529] mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Background Card</p>
                    <p className="text-xs text-text-muted">#0e1529</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Accent Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-neon-blue mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Neon Blue</p>
                    <p className="text-xs text-text-muted">#2E75FF</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-neon-purple mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Neon Purple</p>
                    <p className="text-xs text-text-muted">#8A56FF</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-neon-teal mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Neon Teal</p>
                    <p className="text-xs text-text-muted">#2FFFDD</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">State Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-success mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Success</p>
                    <p className="text-xs text-text-muted">#2FFFAA</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-warning mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Warning</p>
                    <p className="text-xs text-text-muted">#FFBB3A</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-danger mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Danger</p>
                    <p className="text-xs text-text-muted">#FF4A6B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ATMFCardBody>
      </ATMFCard>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ATMFCard neonBorder="blue">
          <ATMFCardBody>
            <h3 className="text-lg font-semibold mb-2">Neon Blue Border</h3>
            <p className="text-text-muted">Cards can have glowing neon blue borders</p>
          </ATMFCardBody>
        </ATMFCard>
        
        <ATMFCard neonBorder="purple">
          <ATMFCardBody>
            <h3 className="text-lg font-semibold mb-2">Neon Purple Border</h3>
            <p className="text-text-muted">Cards can have glowing neon purple borders</p>
          </ATMFCardBody>
        </ATMFCard>
        
        <ATMFCard neonBorder="teal">
          <ATMFCardBody>
            <h3 className="text-lg font-semibold mb-2">Neon Teal Border</h3>
            <p className="text-text-muted">Cards can have glowing neon teal borders</p>
          </ATMFCardBody>
        </ATMFCard>
      </div>
    </div>
  );
}

function ComponentsSection() {
  return (
    <div className="space-y-8">
      {/* Status Badge Examples */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-semibold">Status Badges</h3>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Color Variants</h4>
              <div className="flex flex-wrap gap-3">
                <StatusBadge variant="blue">Blue Badge</StatusBadge>
                <StatusBadge variant="purple">Purple Badge</StatusBadge>
                <StatusBadge variant="teal">Teal Badge</StatusBadge>
                <StatusBadge variant="success">Success Badge</StatusBadge>
                <StatusBadge variant="warning">Warning Badge</StatusBadge>
                <StatusBadge variant="danger">Danger Badge</StatusBadge>
                <StatusBadge variant="muted">Muted Badge</StatusBadge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">With Status Dot</h4>
              <div className="flex flex-wrap gap-3">
                <StatusBadge variant="blue" dot>Active</StatusBadge>
                <StatusBadge variant="purple" dot>Processing</StatusBadge>
                <StatusBadge variant="success" dot>Completed</StatusBadge>
                <StatusBadge variant="warning" dot>Pending</StatusBadge>
                <StatusBadge variant="danger" dot>Failed</StatusBadge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Size Variants</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <StatusBadge variant="blue" size="sm">Small</StatusBadge>
                <StatusBadge variant="blue" size="md">Medium</StatusBadge>
                <StatusBadge variant="blue" size="lg">Large</StatusBadge>
              </div>
            </div>
          </div>
        </ATMFCardBody>
      </ATMFCard>
      
      {/* Icon Wrapper Examples */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-semibold">Icon Wrappers</h3>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Color Variants</h4>
              <div className="flex flex-wrap gap-4">
                <IconWrapper variant="blue"><BarChart3 /></IconWrapper>
                <IconWrapper variant="purple"><Download /></IconWrapper>
                <IconWrapper variant="teal"><Zap /></IconWrapper>
                <IconWrapper variant="success"><CheckCircle /></IconWrapper>
                <IconWrapper variant="warning"><AlertTriangle /></IconWrapper>
                <IconWrapper variant="danger"><XCircle /></IconWrapper>
                <IconWrapper variant="muted"><Settings /></IconWrapper>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Size Variants</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <IconWrapper variant="blue" size="sm"><BarChart3 /></IconWrapper>
                <IconWrapper variant="blue" size="md"><BarChart3 /></IconWrapper>
                <IconWrapper variant="blue" size="lg"><BarChart3 /></IconWrapper>
                <IconWrapper variant="blue" size="xl"><BarChart3 /></IconWrapper>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Rounded Variants</h4>
              <div className="flex flex-wrap gap-4">
                <IconWrapper variant="purple" rounded="full"><BellRing /></IconWrapper>
                <IconWrapper variant="purple" rounded="lg"><BellRing /></IconWrapper>
                <IconWrapper variant="purple" rounded="md"><BellRing /></IconWrapper>
              </div>
            </div>
          </div>
        </ATMFCardBody>
      </ATMFCard>
      
      {/* Progress Bar Examples */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-semibold">Progress Bars</h3>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Color Variants</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Blue</span>
                    <span className="text-sm">75%</span>
                  </div>
                  <ProgressBar value={75} variant="blue" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Purple</span>
                    <span className="text-sm">60%</span>
                  </div>
                  <ProgressBar value={60} variant="purple" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Teal</span>
                    <span className="text-sm">45%</span>
                  </div>
                  <ProgressBar value={45} variant="teal" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Success</span>
                    <span className="text-sm">90%</span>
                  </div>
                  <ProgressBar value={90} variant="success" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Warning</span>
                    <span className="text-sm">30%</span>
                  </div>
                  <ProgressBar value={30} variant="warning" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Danger</span>
                    <span className="text-sm">15%</span>
                  </div>
                  <ProgressBar value={15} variant="danger" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Height Variants</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Small</span>
                  </div>
                  <ProgressBar value={60} height="sm" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Medium</span>
                  </div>
                  <ProgressBar value={60} height="md" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Large</span>
                  </div>
                  <ProgressBar value={60} height="lg" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">With Animation</h4>
              <ProgressBar value={70} animated showPercentage />
            </div>
          </div>
        </ATMFCardBody>
      </ATMFCard>
      
      {/* Card Examples */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-semibold">Cards</h3>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Standard Card</h4>
                <ATMFCard>
                  <ATMFCardHeader>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Card Title</h4>
                      <IconWrapper variant="blue" size="sm"><Settings /></IconWrapper>
                    </div>
                  </ATMFCardHeader>
                  <ATMFCardBody>
                    <p className="text-text-muted">This is the main content of the card</p>
                  </ATMFCardBody>
                  <ATMFCardFooter>
                    <div className="flex justify-between items-center">
                      <StatusBadge variant="success" dot>Active</StatusBadge>
                      <div className="flex items-center text-neon-blue cursor-pointer">
                        <span className="text-sm mr-1">View Details</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </ATMFCardFooter>
                </ATMFCard>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Glassmorphism Card</h4>
                <ATMFCard glassmorphism>
                  <ATMFCardHeader>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Glassmorphism Card</h4>
                      <IconWrapper variant="purple" size="sm"><BellRing /></IconWrapper>
                    </div>
                  </ATMFCardHeader>
                  <ATMFCardBody>
                    <p className="text-text-muted">This card has a glassmorphism effect</p>
                  </ATMFCardBody>
                  <ATMFCardFooter>
                    <div className="flex justify-between items-center">
                      <StatusBadge variant="purple" dot>Premium</StatusBadge>
                      <div className="flex items-center text-neon-purple cursor-pointer">
                        <span className="text-sm mr-1">Learn More</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </ATMFCardFooter>
                </ATMFCard>
              </div>
            </div>
          </div>
        </ATMFCardBody>
      </ATMFCard>
    </div>
  );
}

function UtilitiesSection() {
  return (
    <div className="space-y-8">
      {/* Gradient Backgrounds */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-semibold">Gradient Backgrounds</h3>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Blue Gradient</h4>
              <div className="h-32 rounded-lg bg-gradient-radial-blue p-4 flex items-center justify-center">
                <p className="text-white">bg-gradient-radial-blue</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Dark Blue Gradient</h4>
              <div className="h-32 rounded-lg bg-gradient-radial-dark-blue p-4 flex items-center justify-center">
                <p className="text-white">bg-gradient-radial-dark-blue</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Purple Gradient</h4>
              <div className="h-32 rounded-lg bg-gradient-radial-purple p-4 flex items-center justify-center">
                <p className="text-white">bg-gradient-radial-purple</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Blue-Purple Gradient</h4>
              <div className="h-32 rounded-lg bg-gradient-radial-blue-purple p-4 flex items-center justify-center">
                <p className="text-white">bg-gradient-radial-blue-purple</p>
              </div>
            </div>
          </div>
        </ATMFCardBody>
      </ATMFCard>
      
      {/* Text Utilities */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-semibold">Text Utilities</h3>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Text Colors</h4>
              <div className="space-y-2">
                <p className="text-text-primary">Primary Text Color</p>
                <p className="text-text-secondary">Secondary Text Color</p>
                <p className="text-text-muted">Muted Text Color</p>
                <p className="text-neon-blue">Neon Blue Text</p>
                <p className="text-neon-purple">Neon Purple Text</p>
                <p className="text-neon-teal">Neon Teal Text</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Neon Text Effects</h4>
              <div className="space-y-2">
                <p className="neon-text-blue text-lg">Neon Blue Text with Glow</p>
                <p className="neon-text-purple text-lg">Neon Purple Text with Glow</p>
                <p className="neon-text-teal text-lg">Neon Teal Text with Glow</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Animated Text</h4>
              <div className="space-y-2">
                <p className="neon-text text-lg text-neon-blue">Animated Pulsating Text</p>
              </div>
            </div>
          </div>
        </ATMFCardBody>
      </ATMFCard>
    </div>
  );
}