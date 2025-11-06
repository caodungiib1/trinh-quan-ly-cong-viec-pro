
export enum TrangThai {
  CanLam = 'Cần làm',
  DangLam = 'Đang làm',
  DaXong = 'Đã xong',
  BiHuy = 'Bị hủy',
}

export enum DoUuTien {
  Cao = 'Cao',
  TrungBinh = 'Trung bình',
  Thap = 'Thấp',
}

export enum VaiTro {
  QuanTri = 'Quản trị',
  NhanVien = 'Nhân viên',
}

export interface DuAn {
  id: string;
  ten: string;
  mauSac: string;
  maToChuc: string;
}

export interface NguoiDung {
  id: string;
  ten: string;
  avatar: string;
  username: string;
  password: string;
  vaiTro: VaiTro;
  maToChuc: string;
}

export interface CongViec {
  id: string;
  tieuDe: string;
  moTa: string;
  trangThai: TrangThai;
  doUuTien: DoUuTien;
  ngay: string; // ISO string date
  hanChot: string; // ISO string date
  ngayHoanThanh?: string | null; // ISO string date
  nguoiPhuTrachId: string;
  duAnId: string;
  maToChuc: string;
}
