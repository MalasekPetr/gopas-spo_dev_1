/**
 * One row of the EquipmentLoans list. Equipment is a lookup column:
 * read as the expanded object (Equipment/Title), written as the number EquipmentId.
 */
export interface ILoan {
  Id: number;
  EquipmentId: number;
  Equipment?: { Title: string };
  Borrower?: { Title: string; EMail: string };
  IssuedOn: string;
  /** Empty = the loan is still open (SharePoint returns null for an empty date). */
  ReturnedOn?: string;
}
