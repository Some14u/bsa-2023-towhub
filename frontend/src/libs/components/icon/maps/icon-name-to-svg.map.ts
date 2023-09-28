import {
  type IconDefinition,
  faArrowDownLong,
  faBars,
  faCar,
  faCaretDown,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronUp,
  faClock,
  faClockRotateLeft,
  faCloudUploadAlt,
  faEye,
  faFile,
  faGear,
  faListUl,
  faLocationDot,
  faMap,
  faMobileScreenButton,
  faPen,
  faPhone,
  faPlus,
  faRightFromBracket,
  faStar,
  faSync,
  faTrashCan,
  faTruckPickup,
  faUser,
  faUserPen,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { IconName } from '~/libs/enums/icon-name.enum.js';
import { type ValueOf } from '~/libs/types/types.js';

const iconNameToSvg: Record<ValueOf<typeof IconName>, IconDefinition> = {
  [IconName.ARROW_DOWN_LONG]: faArrowDownLong,
  [IconName.PLUS]: faPlus,
  [IconName.CARET_DOWN]: faCaretDown,
  [IconName.CHEVRON_DOWN]: faChevronDown,
  [IconName.CHEVRON_LEFT]: faChevronLeft,
  [IconName.CHEVRON_UP]: faChevronUp,
  [IconName.EDIT]: faPen,
  [IconName.GEAR]: faGear,
  [IconName.STAR]: faStar,
  [IconName.LOCATION_DOT]: faLocationDot,
  [IconName.MAP]: faMap,
  [IconName.CLOUD_UPLOAD]: faCloudUploadAlt,
  [IconName.FILE]: faFile,
  [IconName.CHECK]: faCheck,
  [IconName.LIST]: faListUl,
  [IconName.BARS]: faBars,
  [IconName.CLOCK_ROTATE_LEFT]: faClockRotateLeft,
  [IconName.USER_PEN]: faUserPen,
  [IconName.RIGHT_FROM_BRACKET]: faRightFromBracket,
  [IconName.TRASH]: faTrashCan,
  [IconName.TRUCK]: faTruckPickup,
  [IconName.USERS]: faUsers,
  [IconName.USER]: faUser,
  [IconName.XMARK]: faXmark,
  [IconName.EYE]: faEye,
  [IconName.MOBILE]: faMobileScreenButton,
  [IconName.PHONE]: faPhone,
  [IconName.CLOCK]: faClock,
  [IconName.CAR]: faCar,
  [IconName.SYNC]: faSync,
};

export { iconNameToSvg };
