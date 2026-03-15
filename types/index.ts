// API レスポンス型

export type RegisterResponse = {
  participantId: string;
};

import type { Question } from "@/data/questions";
export type QuestionForClient = Omit<Question, "correctIndex">;

export type AnswerRequest = {
  participantId: string;
  questionId: number;
  selectedIndex: number;
};

export type AnswerResponse = {
  correct: boolean;
  correctIndex: number;
  currentScore: number;
};

// SSE で配信するリアルタイムデータ
export type StreamData = {
  votes: VoteData[];
  leaderboard: LeaderboardEntry[];
};

export type VoteData = {
  questionId: number;
  counts: number[]; // 選択肢ごとの得票数 [A票, B票, C票, D票]
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
};
