"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Project, Client } from "@/types";

type ProjectWithClient = Project & { client: Client };

// Resonant bell sound
function playBell(volume = 0.1) {
  if (typeof window === "undefined") return;
  const audio = new AudioContext();
  const now = audio.currentTime;

  const frequencies = [330, 660, 1320];
  const decays = [2.0, 1.4, 1.0];
  const volumes = [volume, volume * 0.35, volume * 0.15];

  frequencies.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(2, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);

    osc.frequency.setValueAtTime(freq, now);
    osc.type = "sine";

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volumes[i], now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decays[i]);

    osc.start(now);
    osc.stop(now + decays[i]);
  });
}

export function ProjectList({ projects }: { projects: ProjectWithClient[] }) {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/${project.slug}`}
          onClick={() => playBell()}
          className="group block"
        >
          <div className="p-5 border border-white/[0.06] bg-white/[0.02] hover:border-gold-400/20 hover:bg-gold-400/[0.02] transition-all duration-500 rounded-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-light text-white/90 group-hover:text-gold-200 transition-colors duration-300">
                  {project.title}
                </h2>
                <p className="text-sm text-white/40 font-light mt-1">
                  {project.client?.name} · {project.client?.company}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-base font-light text-white/70 tabular-nums">
                    {formatCurrency((project.deposit_amount || 0) + (project.final_amount || 0))}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    {formatDate(project.created_at)}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="p-12 border border-white/[0.06] bg-white/[0.01] text-center rounded-sm">
      <p className="text-white/40 font-light">
        No projects yet. Run the seed script to create one.
      </p>
    </div>
  );
}
