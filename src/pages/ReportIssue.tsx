import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useIssues } from '@/context/IssuesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  X, 
  Sparkles, 
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  Image,
  Send,
  PartyPopper,
  Clock,
  Zap
} from 'lucide-react';
import { categorizeIssue, assignPriority } from '@/lib/aiLogic';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

type FormStep = 1 | 2 | 3;

export default function ReportIssue() {
  const navigate = useNavigate();
  const { addIssue } = useIssues();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState<any>(null);
  const [aiPrediction, setAiPrediction] = useState<{
    category: string;
    priority: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    
    // Show AI prediction after typing 20+ characters
    if (value.length > 20) {
      const category = categorizeIssue(value);
      const priority = assignPriority(value);
      setAiPrediction({
        category: CATEGORY_LABELS[category],
        priority: PRIORITY_LABELS[priority],
      });
    } else {
      setAiPrediction(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceedToStep2 = title.trim().length > 3 && description.trim().length > 10;
  const canProceedToStep3 = address.trim().length > 3;
  const canSubmit = canProceedToStep2 && canProceedToStep3;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newIssue = addIssue({
      title,
      description,
      location: {
        address,
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
      },
      imageUrl: imagePreview || 'https://images.unsplash.com/photo-1605460375648-278bcbd579a6?w=400&h=300&fit=crop',
      reportedBy: user.name,
    });

    setSubmittedIssue(newIssue);
    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: 'Issue Reported Successfully!',
      description: `Your issue has been categorized as "${CATEGORY_LABELS[newIssue.category]}" with ${PRIORITY_LABELS[newIssue.priority]} priority.`,
    });
  };

  const steps = [
    { number: 1, title: 'Issue Details', icon: FileText },
    { number: 2, title: 'Location & Photo', icon: Image },
    { number: 3, title: 'Review & Submit', icon: Send },
  ];

  // Success Screen
  if (isSubmitted && submittedIssue) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container py-12 flex-1 flex items-center justify-center">
          <AnimatedSection className="max-w-lg mx-auto text-center">
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-status-resolved/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-status-resolved/10 border-2 border-status-resolved">
                <CheckCircle className="h-12 w-12 text-status-resolved animate-scale-in" />
              </div>
              <div className="absolute -top-2 -right-2">
                <PartyPopper className="h-8 w-8 text-status-reported animate-bounce" />
              </div>
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Issue Reported Successfully!
            </h1>
            <p className="text-muted-foreground mb-8">
              Thank you for making your community better. Your report has been submitted and will be reviewed shortly.
            </p>

            {/* Issue Summary */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-4">{submittedIssue.title}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground">{CATEGORY_LABELS[submittedIssue.category]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-priority-medium" />
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="font-medium text-foreground">{PRIORITY_LABELS[submittedIssue.priority]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">{submittedIssue.location.address}</span>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 mb-8 text-left">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                What Happens Next?
              </h4>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                  <span>Your issue will be reviewed by city officials within 24-48 hours.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                  <span>Once assigned, status will change to "In Progress".</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                  <span>You can track progress on the Issues page or Map view.</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate('/issues')} className="flex-1">
                View All Issues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => {
                setIsSubmitted(false);
                setSubmittedIssue(null);
                setTitle('');
                setDescription('');
                setAddress('');
                setImagePreview(null);
                setCurrentStep(1);
                setAiPrediction(null);
              }} className="flex-1">
                Report Another Issue
              </Button>
            </div>
          </AnimatedSection>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <AnimatedSection className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              New Report
            </span>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Report an Issue
            </h1>
            <p className="text-muted-foreground">
              Help improve your community by reporting local issues. Our AI will automatically categorize and prioritize your report.
            </p>
          </AnimatedSection>

          {/* Step Indicator */}
          <AnimatedSection delay={50} className="mb-10">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
              <div 
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
              
              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                const Icon = step.icon;
                
                return (
                  <div key={step.number} className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 z-10",
                        isCompleted && "bg-primary border-primary text-primary-foreground",
                        isActive && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30",
                        !isActive && !isCompleted && "bg-card border-border text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      "mt-2 text-xs font-medium hidden sm:block",
                      isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          {/* Step Content */}
          <AnimatedSection delay={100} key={currentStep}>
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              {/* Step 1: Issue Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue (e.g., Large pothole on Main Street)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue in detail. Include information about the severity, how long it's been a problem, and any safety concerns."
                      value={description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                    
                    {/* AI Prediction */}
                    {aiPrediction && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">AI Prediction</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Category: <span className="font-medium text-foreground">{aiPrediction.category}</span>
                            {' • '}
                            Priority: <span className="font-medium text-foreground">{aiPrediction.priority}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Location & Photo */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="Street address or landmark"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-12 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Photo (Optional but recommended)</Label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-64 mx-auto rounded-xl object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            <Camera className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Click to upload a photo
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              PNG, JPG up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl font-semibold text-foreground">Review Your Report</h3>
                    <p className="text-sm text-muted-foreground mt-1">Please verify the information before submitting</p>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Title</p>
                      <p className="font-medium text-foreground">{title}</p>
                    </div>

                    {/* Description */}
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground text-sm">{description}</p>
                    </div>

                    {/* Location */}
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {address}
                      </p>
                    </div>

                    {/* AI Prediction */}
                    {aiPrediction && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          AI Classification
                        </p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="font-medium text-foreground">{aiPrediction.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Priority</p>
                            <p className="font-medium text-foreground">{aiPrediction.priority}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="p-4 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-2">Attached Photo</p>
                        <img 
                          src={imagePreview} 
                          alt="Issue" 
                          className="max-h-40 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((currentStep - 1) as FormStep)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((currentStep + 1) as FormStep)}
                    disabled={currentStep === 1 ? !canProceedToStep2 : !canProceedToStep3}
                    className="flex-1"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Report
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* Info Cards */}
          <AnimatedSection delay={150} className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">AI-Powered</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our AI automatically categorizes your report and assigns priority based on the description.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Track Progress</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Once submitted, you can track the status of your report from Reported to Resolved.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
