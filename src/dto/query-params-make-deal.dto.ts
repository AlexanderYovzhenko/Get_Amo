import { IsString, IsNotEmpty } from 'class-validator';
import { SHOULD_BE_REQUIRED, SHOULD_BE_STRING } from 'src/common/constants';

class MakeDealQueryDto {
  @IsNotEmpty({ message: SHOULD_BE_REQUIRED })
  @IsString({ message: SHOULD_BE_STRING })
  readonly name: string;

  @IsNotEmpty({ message: SHOULD_BE_REQUIRED })
  @IsString({ message: SHOULD_BE_STRING })
  readonly email: string;

  @IsNotEmpty({ message: SHOULD_BE_REQUIRED })
  @IsString({ message: SHOULD_BE_STRING })
  readonly phone: string;
}

export { MakeDealQueryDto };
