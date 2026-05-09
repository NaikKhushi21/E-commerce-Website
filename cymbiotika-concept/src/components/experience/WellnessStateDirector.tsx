"use client";

import { useEffect } from "react";

type SceneState = {
  id: string;
  state: "focus" | "recover" | "sleep" | "perform" | "balance";
};

const SCENES: SceneState[] = [
  { id: "scene-hero", state: "focus" },
  { id: "scene-trust", state: "balance" },
  { id: "scene-products", state: "perform" },
  { id: "scene-video", state: "focus" },
  { id: "scene-story", state: "recover" },
  { id: "scene-focus", state: "sleep" },
  { id: "scene-absorption", state: "perform" },
];

export function WellnessStateDirector() {
  useEffect(() => {
    const update = (state: SceneState["state"]) => {
      document.body.dataset.wellnessState = state;
    };

    update("focus");

    const observers: IntersectionObserver[] = [];

    SCENES.forEach((scene) => {
      const node = document.getElementById(scene.id);
      if (!node) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.46) {
              update(scene.state);
            }
          }
        },
        {
          threshold: [0.38, 0.46, 0.58],
          rootMargin: "-20% 0px -30% 0px",
        },
      );

      observer.observe(node);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      delete document.body.dataset.wellnessState;
    };
  }, []);

  return null;
}
