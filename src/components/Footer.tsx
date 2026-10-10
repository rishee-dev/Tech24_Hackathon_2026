import { MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-card">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container relative py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-foreground">CityFix</span>
                <p className="text-xs text-primary font-medium">Smarter Cities. Faster Solutions.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              An AI-powered platform empowering citizens to report local issues and enabling authorities to respond faster. Making communities better, one report at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/issues" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Issues
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-muted-foreground hover:text-primary transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-muted-foreground hover:text-primary transition-colors">
                  Map View
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 CityFix. Making communities better, one report at a time.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              Team Tech Freakes
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
              Hackathon 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
