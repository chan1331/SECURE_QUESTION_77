export type PaperStatus = 'Created' | 'Reviewed' | 'Approved' | 'Rejected';
export type ReleaseStatus = 'Locked' | 'Released';

export interface IQuestionPaper {
  _id: string;
  paperId: string;
  title: string;
  encryptedContent: string;
  iv: string;
  hash: string;
  status: PaperStatus;
  examDate?: string;
  examTime?: string | Date;
  releaseStatus: ReleaseStatus;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt: string | Date;
  updatedAt: string | Date;
  releasedAt?: string | Date;
  reviewComments?: string;
}

export interface IReview {
  _id: string;
  paperId: string;
  reviewerId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  decision: 'Reviewed' | 'Rejected';
  comments: string;
  createdAt: string | Date;
}
