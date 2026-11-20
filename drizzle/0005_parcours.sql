CREATE TABLE "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"period" text NOT NULL,
	"title" text NOT NULL,
	"organization" text NOT NULL,
	"summary" text,
	"kind" text DEFAULT 'work' NOT NULL,
	"current" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
-- Le parcours repris du CV, du plus récent au plus ancien. Écrit dans la
-- migration et non dans le seed : la table naît avec son contenu, sur toutes
-- les bases où la migration passe, y compris celles déjà seedées.
INSERT INTO "experiences" ("period", "title", "organization", "summary", "kind", "current", "position") VALUES
	('Nov. 2025 — aujourd''hui', 'Analyste Développeur, Lead Dev', 'Netsen Group · HN Donka', 'Code review, choix techniques, applications web et mobile en .NET, React et React Native.', 'work', true, 0),
	('Mai 2024 — oct. 2025', 'Analyste Développeur', 'Netsen Group', 'Architectures logicielles, applications d''entreprise en .NET et Angular, maintenance en production.', 'work', false, 1),
	('Sept. 2023 — avr. 2024', 'Analyste Développeur junior', 'Netsen Group', 'Analyse des besoins, suivi et évaluation des stagiaires.', 'work', false, 2),
	('Mai — août 2022', 'Développeur web Django, stage', 'eMsanté', NULL, 'work', false, 3),
	('Janv. — août 2022', 'Formation développement web', 'Africa Digitale Académie', NULL, 'education', false, 4),
	('2016 — 2020', 'Bac +4 Instrumentation et maintenance', 'Institut Supérieur de Technologie de Mamou', NULL, 'education', false, 5);
