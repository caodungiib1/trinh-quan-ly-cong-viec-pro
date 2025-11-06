
import { DuAn, NguoiDung, CongViec, TrangThai, DoUuTien, VaiTro } from './types';
// FIX: Module '"date-fns"' has no exported member 'startOfWeek'.
import { addDays, formatISO } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';

const today = new Date();
const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
const defaultOrgCode = 'ORG123';

export const DU_AN_DATA: DuAn[] = [
  { id: 'da1', ten: 'Dự án Alpha', mauSac: 'bg-blue-500', maToChuc: defaultOrgCode },
  { id: 'da2', ten: 'Marketing Q3', mauSac: 'bg-green-500', maToChuc: defaultOrgCode },
  { id: 'da3', ten: 'Phát triển App', mauSac: 'bg-purple-500', maToChuc: defaultOrgCode },
  { id: 'da4', ten: 'Nghiên cứu thị trường', mauSac: 'bg-yellow-500', maToChuc: defaultOrgCode },
];

export const NGUOI_DUNG_DATA: NguoiDung[] = [
  { id: 'tv1', ten: 'Vân Anh', avatar: 'https://i.pravatar.cc/150?u=vananh', username: 'vananh', password: 'password123', vaiTro: VaiTro.QuanTri, maToChuc: defaultOrgCode },
  { id: 'tv2', ten: 'Minh Tuấn', avatar: 'https://i.pravatar.cc/150?u=minhtuan', username: 'minhtuan', password: 'password123', vaiTro: VaiTro.NhanVien, maToChuc: defaultOrgCode },
  { id: 'tv3', ten: 'Quốc Bảo', avatar: 'https://i.pravatar.cc/150?u=quocbao', username: 'quocbao', password: 'password123', vaiTro: VaiTro.NhanVien, maToChuc: defaultOrgCode },
];

export const CONG_VIEC_DATA: CongViec[] = [
  {
    id: 'cv1',
    tieuDe: 'Thiết kế UI/UX cho màn hình chính',
    moTa: 'Tạo wireframe và mockup cho trang chủ ứng dụng.',
    trangThai: TrangThai.DangLam,
    doUuTien: DoUuTien.Cao,
    ngay: formatISO(addDays(startOfThisWeek, 0), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 2), { representation: 'date' }),
    nguoiPhuTrachId: 'tv1',
    duAnId: 'da3',
    maToChuc: defaultOrgCode,
  },
  {
    id: 'cv2',
    tieuDe: 'Lên kế hoạch nội dung blog tháng 7',
    moTa: 'Nghiên cứu từ khóa và xác định các chủ đề bài viết.',
    trangThai: TrangThai.CanLam,
    doUuTien: DoUuTien.TrungBinh,
    ngay: formatISO(addDays(startOfThisWeek, 0), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 4), { representation: 'date' }),
    nguoiPhuTrachId: 'tv2',
    duAnId: 'da2',
    maToChuc: defaultOrgCode,
  },
  {
    id: 'cv3',
    tieuDe: 'Fix bug login trên iOS',
    moTa: 'Người dùng báo không thể login bằng tài khoản Google.',
    trangThai: TrangThai.DaXong,
    ngayHoanThanh: formatISO(addDays(startOfThisWeek, -1), { representation: 'date' }),
    doUuTien: DoUuTien.Cao,
    ngay: formatISO(addDays(startOfThisWeek, 1), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 1), { representation: 'date' }),
    nguoiPhuTrachId: 'tv3',
    duAnId: 'da3',
    maToChuc: defaultOrgCode,
  },
  {
    id: 'cv4',
    tieuDe: 'Phân tích đối thủ cạnh tranh',
    moTa: 'Đánh giá các sản phẩm tương tự trên thị trường.',
    trangThai: TrangThai.CanLam,
    doUuTien: DoUuTien.Thap,
    ngay: formatISO(addDays(startOfThisWeek, 2), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 6), { representation: 'date' }),
    nguoiPhuTrachId: 'tv1',
    duAnId: 'da4',
    maToChuc: defaultOrgCode,
  },
  {
    id: 'cv5',
    tieuDe: 'Họp team Dự án Alpha',
    moTa: 'Cập nhật tiến độ và thảo luận các vấn đề còn tồn đọng.',
    trangThai: TrangThai.CanLam,
    doUuTien: DoUuTien.TrungBinh,
    ngay: formatISO(addDays(startOfThisWeek, 3), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 3), { representation: 'date' }),
    nguoiPhuTrachId: 'tv3',
    duAnId: 'da1',
    maToChuc: defaultOrgCode,
  },
  {
    id: 'cv6',
    tieuDe: 'Triển khai API endpoint cho sản phẩm',
    moTa: 'Xây dựng API GET /products và POST /products.',
    trangThai: TrangThai.DangLam,
    doUuTien: DoUuTien.Cao,
    ngay: formatISO(addDays(startOfThisWeek, 4), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 5), { representation: 'date' }),
    nguoiPhuTrachId: 'tv3',
    duAnId: 'da1',
    maToChuc: defaultOrgCode,
  },
   {
    id: 'cv7',
    tieuDe: 'Viết bài blog "Top 10 xu hướng marketing 2024"',
    moTa: 'Dựa trên kế hoạch nội dung đã chốt.',
    trangThai: TrangThai.CanLam,
    doUuTien: DoUuTien.TrungBinh,
    ngay: formatISO(addDays(startOfThisWeek, 2), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 6), { representation: 'date' }),
    nguoiPhuTrachId: 'tv2',
    duAnId: 'da2',
    maToChuc: defaultOrgCode,
  },
   {
    id: 'cv8',
    tieuDe: 'Test tính năng thanh toán',
    moTa: 'Kiểm tra luồng thanh toán qua VNPAY và MoMo.',
    trangThai: TrangThai.CanLam,
    doUuTien: DoUuTien.Cao,
    ngay: formatISO(addDays(startOfThisWeek, 5), { representation: 'date' }),
    hanChot: formatISO(addDays(startOfThisWeek, 6), { representation: 'date' }),
    nguoiPhuTrachId: 'tv1',
    duAnId: 'da3',
    maToChuc: defaultOrgCode,
  },
];
