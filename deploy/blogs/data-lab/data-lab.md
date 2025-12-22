# 数据实验

这是我关于深入理解计算机系统这本书配套实验之一数据实验的实现思路，所有代码都在linux/x86上验证过是可行的，但不保证是最优解

本实验包括实现简单的逻辑函数、二元补码函数和浮点函数，但使用的是高度受限的c语言子集。帮助你理解C数据类型的位级表示以及数据操作的位级行为。

## 一：实现异或

```c
/*
 * bitXor - x^y using only ~ and &
 *   Example: bitXor(4, 5) = 1
 *   Legal ops: ~ &
 *   Max ops: 14
 *   Rating: 1
 */
int bitXor(int x, int y) {

  return 2;

}
```

模拟 ^ 操作，允许使用以下操作符。

- ~ &

操作符^表示异或操作，对于int类型，x^y的结果相当于把x、y的二进制形式依次比较，相同的位结果为0，不同的位结果为1。

操作符&表示与操作，对于int类型，x&y的结果相当于分别把x、y的二进制形式依次检测每个位，同时为1结果为1，否则为0。

操作符～相当于NOT，对于int类型，～x的结果相当于把x的二进制形式每个位取反。

| 十进制 | 二进制（4字节表示）                 |
| ------ | ----------------------------------- |
| 4      | 00000000 00000000 00000000 00000100 |
| 5      | 00000000 00000000 00000000 00000101 |
| 4^5    | 00000000 00000000 00000000 00000001 |
| 4&5    | 00000000 00000000 00000000 00000101 |
| ～4    | 11111111 11111111 11111111 11111011 |

对两个只有一位的二进制数进行^操作，只有四种情况。

| x   | y   | x ^ y |
| --- | --- | :---: |
| 0   | 0   |   0   |
| 0   | 1   |   1   |
| 1   | 0   |   1   |
| 1   | 1   |   0   |

排除x，y都为0或者都为1的情况，x^y=1。我们可以用&模拟排除操作。

- 把x，y相同位同时是0的情况标记为0，其他情况标记为1，表达式为~(~x&~y)。
- 把x，y相同位同时是1的情况标记为0，其他情况标记为1，表达式为~(x&y)。

对这两种情况进行&操作即为结果 ~(~x&~y)&~(x&y)。

```c
//1
/*
 * bitXor - x^y using only ~ and &
 *   Example: bitXor(4, 5) = 1
 *   Legal ops: ~ &
 *   Max ops: 14
 *   Rating: 1
 */
int bitXor(int x, int y) {

  return ~(~x&~y)&~(x&y);

}
```

## 二：计算最小补码

```c
/*
 * tmin - return minimum two's complement integer
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {

  return 2;

}
```

返回补码的最小值，可以使用以下操作符。

- ! ~ & ^ | + << >>

计算机通常使用补码来表示有符号数，并且最高位解释为负权。

| 十进制 | 补码（4字节表示）                   | 计算过程                                        |
| ------ | ----------------------------------- | ----------------------------------------------- |
| 2      | 00000000 00000000 00000000 00000010 | $$-0\*2^{31}+0\*2^{30}+...+1\*2^1+0\*2^0 = 2$$  |
| -2     | 11111111 11111111 11111111 11111110 | $$-1\*2^{31}+1\*2^{30}+...+1\*2^1+0\*2^0 = -2$$ |

由定义可知道当符号位是1其余位是0，就是最小的补码。不管是编码，还是补码<<操作会在右边自动补0，因此 1 << 31 即为结果。

```c
/*
 * tmin - return minimum two's complement integer
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {

  return 1 << 31;

}
```

## 三：补码最大值

```c
/*
 * isTmax - returns 1 if x is the maximum, two's complement number,
 *     and 0 otherwise
 *   Legal ops: ! ~ & ^ | +
 *   Max ops: 10
 *   Rating: 1
 */
int isTmax(int x) {
  return 2;
}
```

如果x是补码最大值，就返回1，其他情况返回0。可以使用以下操作符。

- ! ~ & ^ | +

在执行^计算时，x ^ x 的结果一定是0。补码最大值是符号位是0，其他位都为1的情况，比如一字节最大的补码就是01111111。假设x是补码最大值(01111111)，可以推导出。

- x+1=10000000
- ~(x+1)=01111111
- ~(x+1)^x=00000000

所以补码最大值经过逻辑运算~(x+1)^x结果一定是0，那么其他情况经过相同的运算，结果是否为0呢？答案是只有x+1后所有位都发生了变化时~(x+1)=x，~(x+1)^x=0。

计算机在处理溢出结果时，会丢弃高位。假设c是一字节的数据，二进制表示为11111111。c + 1 = 100000000，此时发生了溢出，丢弃最高位后结果为00000000，全部位与原来相反。所以除了最大补码，还有这种情况满足~(x+1)=x，根据本题的要求，这种情况应该返回0。

因为1&0=0，1&1=1，所以需要找到一个表达式满足x是最大补码时结果是1，x所有位都是1时，结果是0。可以利用只有位全部相同的两个数 ^ 结果才为0这个特点。表达式 ((!!(x^0xffffffff))) 满足这个条件，0xffffffff是16进制表示，相当于32位全为1。最终表达式为(!((~(x+1))^x))&((!!(x^0xffffffff)))

```c
/*
 * isTmax - returns 1 if x is the maximum, two's complement number,
 *     and 0 otherwise
 *   Legal ops: ! ~ & ^ | +
 *   Max ops: 10
 *   Rating: 1
 */
int isTmax(int x) {
  return (!((~(x+1))^x))&((!!(x^0xffffffff)));
}
```

## 四：奇数位判断

```c
/*
 * allOddBits - return 1 if all odd-numbered bits in word set to 1
 *   where bits are numbered from 0 (least significant) to 31 (most significant)
 *   Examples allOddBits(0xFFFFFFFD) = 0, allOddBits(0xAAAAAAAA) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 2
 */
int allOddBits(int x) {
  return 2;
}
```

如果奇数位全部是1时，返回1，允许使用以下操作符。

- ! ~ & ^ | + << >>

二进制中每个比特位要么是0要么是1，十六进制数0xaaaaaaaa的二进制表示为奇数位是0偶数位是1。只有x的奇数位全为1时 x & 0xaaaaaaaa = 0xaaaaaaaa，可以用 x^x=0的特性判断&的结果,最终结果为：!((x & 0xaaaaaaaa) ^ 0xaaaaaaaa)

```c
/*
 * allOddBits - return 1 if all odd-numbered bits in word set to 1
 *   where bits are numbered from 0 (least significant) to 31 (most significant)
 *   Examples allOddBits(0xFFFFFFFD) = 0, allOddBits(0xAAAAAAAA) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 2
 */
int allOddBits(int x) {
  return !((x & 0xaaaaaaaa) ^ 0xaaaaaaaa);
}
```

## 五：相反数

```c
/*
 * negate - return -x
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
  return 2;
}
```

返回x的相反数。允许使用以下操作。

- ! ~ & ^ | + << >>

假设y是x的相反数，则x + y = 0，所以只需要找到x的表达式代替y即可。

任意x，x + ~x 的结果所有位一定全为1，所以x + ~x + 1 会发生溢出，结果是所有位都为0。所以 ~x + 1 就是x的相反数。

```c
/*
 * negate - return -x
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
  return ~x + 1;
}
```

## 六：范围判断

```c
/*
 * isAsciiDigit - return 1 if 0x30 <= x <= 0x39 (ASCII codes for characters '0' to '9')
 *   Example: isAsciiDigit(0x35) = 1.
 *            isAsciiDigit(0x3a) = 0.
 *            isAsciiDigit(0x05) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 3
 */
int isAsciiDigit(int x) {
  return 2;
}
```

如果x是ASCII编码中数字对应的值就返回1。允许使用以下操作符。

- ! ~ & ^ | + << >>

ASCII编码表中有10个数字字符'0'-'9'，对应的值为0x30-0x39。

符合条件的整数x需要满足0x2f < x < 0x3a，满足条件的x一定是正数，同号相减不会出现溢出问题，所以。

- 0x2f - x < 0
- x - 0x3a < 0

但是本题不允许使用-，上一题我们了解到 x - y 等价于 x + (~y+1)，所以可以转化为。

- 0x2f + (~x+1) < 0
- x + (~0x3a+1) < 0

同时本题不允许使用 < ，那么怎么判断是否小于0呢？也就是说怎么判断表达式的值是负数。由补码的定义得知，首位是1一定是负数，此时右移一定是在左边补1，如果补0，说明首位不是1。

所以x是负数时 !!(x >> 31) = 1, 满足题目需要的结果。

```c
/*
 * isAsciiDigit - return 1 if 0x30 <= x <= 0x39 (ASCII codes for characters '0' to '9')
 *   Example: isAsciiDigit(0x35) = 1.
 *            isAsciiDigit(0x3a) = 0.
 *            isAsciiDigit(0x05) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 3
 */
int isAsciiDigit(int x) {
  return !!((0x2f + (~x+1)) >> 31) & !!((x + (~0x3a+1)) >> 31);
}
```

## 七：模拟三元表达式

```c
/*
 * conditional - same as x ? y : z
 *   Example: conditional(2,4,5) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 16
 *   Rating: 3
 */
int conditional(int x, int y, int z) {
  return 2;
}
```

模拟三元表达式。传入三个参数x,y,z。x为真返回y，否则返回z。允许使用以下操作符。

- ! ~ & ^ | + << >>

首先想到的是需要判断x的真假，可以用表达式!!x实现。x是0时 !!x是0，否则是1。类似于三元表达式，本题需要在判断真假的同时，原样的返回y或者z，对于任意整数a，一定有:

- a & 0xffffffff = a
- a & 0x00000000 = 0
- a | 0x00000000 = a

这是常用的掩码手段。

当我们把 !!x 左移31位 再右移 31 位他的值只有0xffffffff或者0x0000000这两种情况。我们可以利用这一点把条件判断和掩码操作结合起来，可得到结果。

```c
/*
 * conditional - same as x ? y : z
 *   Example: conditional(2,4,5) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 16
 *   Rating: 3
 */
int conditional(int x, int y, int z) {
  int mask = (!!x) << 31 >> 31;
  return (mask & y) | (~mask & z);
}
```

## 八：两数比较

```c
/*
 * isLessOrEqual - if x <= y  then return 1, else return 0
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  return 2;
}
```

x <= y 成立时返回1，其他情况返回0，允许使用以下操作符。

- ! ~ & ^ | + << >>

考虑到两数相加或者相减会有溢出情况，首先计算符号位。

- signX = x >> 31 & 1
- signY = y >> 31 & 1

接下来分别分析符号不同与相同的情况。

- 符号相同时
  !(signX ^ signY) = 1。

  符号相同时减法不会溢出，所以x <= y 成立时， x-y-1 < 0。所以我们只需在条件满足时让表达式x-y-1的值为1，不满足时为0即可。x-y-1 等价于 x + (~y+1) + (~1 + 1)，表达式小于0意味着是负数，符号位是1，左移31位后一定会得到32位全是1的一个值，否则会得到32位全是0。借助!进行规格化判断即可，最终判断条件为:(!(signX ^ signY) & !!((x + (~y+1) + (~1 + 1))>>31))

- 符号不同时
  !!(signX ^ signY) = 1。

  符号不同，且x <= y 成立，只有在x是负数，y是正数时满足。(!(signX ^ signY) & (!!signX))

综合两部部分用 | 链接即为答案。

```c
/*
 * isLessOrEqual - if x <= y  then return 1, else return 0
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  int signX = x >> 31 & 1;
  int signY = y >> 31 & 1;
  return ((!!(signX ^ signY)) & (!!signX)) | (!(signX ^ signY) & !!((x + (~y+1) + (~1 + 1))>>31));
}
```

## 九：实现非

```c
/*
 * logicalNeg - implement the ! operator, using all of
 *              the legal operators except !
 *   Examples: logicalNeg(3) = 0, logicalNeg(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4
 */
int logicalNeg(int x) {
  return 2;
}
```

实现!操作符，可以使用以下操作符。

- ~ & ^ | + << >>

输入0时，返回1，其他情况返回0，首先需要判断输入的是否是0。只有x=0时， x和x的相反数都不是负数，也就是排除0的其他情况，都会至少有一个数首位是1。所以 x 与 x 的相反数做 | 运算时，只有x=0时，最高位才为0。把结果右移31位后，只有 x = 0 时，结果是0x00000000，其他情况都是 0xffffffff。把这个结果+1，就得到了本题的答案。

```c
/*
 * logicalNeg - implement the ! operator, using all of
 *              the legal operators except !
 *   Examples: logicalNeg(3) = 0, logicalNeg(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4
 */
int logicalNeg(int x) {
  return ((x | (~x + 1)) >> 31) + 1;
}
```

## 十：一共多少个比特？

```c
/* howManyBits - return the minimum number of bits required to represent x in
 *             two's complement
 *  Examples: howManyBits(12) = 5
 *            howManyBits(298) = 10
 *            howManyBits(-5) = 4
 *            howManyBits(0)  = 1
 *            howManyBits(-1) = 1
 *            howManyBits(0x80000000) = 32
 *  Legal ops: ! ~ & ^ | + << >>
 *  Max ops: 90
 *  Rating: 4
 */
int howManyBits(int x) {
  return 0;
}
```

在补码规则下，给定参数x，返回最少用几个比特可以描述它。允许使用以下操作符。

- ! ~ & ^ | + << >>
  比如12，在补码的定义下转换为二进制后是01100，一共5位，那么就返回5。

当x是正数时，需要找到最高位的1，从它开始，右边都是有效位，再加上符号位即为结果。

当x是负数时，需要找到最高位的0，从它开始，右边都是有效位，再加上符号位即为结果。

如果把负数的每一位都取反，那么判断正数的逻辑就应用到了判断负数上，后面的计算会容易一些。可以这样转变一下x。

signX = x >> 31;x = (signX&~x) | (~signX&x)

假设signX = x >> 31 如果x >= 0，signX的32位全为0，否则全为1，类似掩码运算，可以把x<0的情况取反，然后只需考虑找到最高位的1即可。

最自然的思路是每次左移一位，然后判断最高位是否是1，但是该题是32位数字，这样写起来就太麻烦了，可以考虑使用二分法。

对于表达式!!x，只要x有某一位是1，表达式的值就是1，否则是0，我们可以对位移后的数进行这样的判断。

signX16 = !!(x >> 16)，如果signX16等于1，那么代表x的高16位有1，这个时候低16位一定是要累加到最终结果里的，如果高16位没有1，那么我们可以忽略高16位，判断低16位。

如果signX16是1，那么表达式 signX16 << 4 的值是16，否则表达式的值是0。也就是说如果表达式的值是16，那么我们需要进一步判断高16位里的高8位，如果是0，我们需要判断低16位里的高8位。

bit_16 = signX16 << 4，x = x >> bit_16，signX8 = !!(x >> 8)

如果高16位有1，那么x右移16位，signX8判断的是高16位中的高8位，否则signX8判断的是低16位里的高8位。

同理。

bit_8 = signX8 << 3，x = x >> bit_8，signX4 = !!(x >> 4)

- 如果高16位有1
  - 如果高8位有1，那么x再右移8位，signX4判断的是高16位中的高8位中的高4位
  - 如果高8位没有1，那么x不会继续位移，signX4判断的是高16位中的低8位中的高4位
- 如果高16位没有1
  - 如果高8位有1，那么x右移8位，signX4判断的是低16位中高8位中的高4位
  - 如果高8位没有1，那么x依然不位移，signX4判断的是低16位中的低8位中的高4位

继续二分。

- bit_4 = signX4 << 2，x = x >> bit_4，signX2 = !!(x >> 2)
- bit_2 = signX2 << 1，x = x >> bit_2，signX1 = !!(x >> 1)
- bit_1 = signX1 ，x = x >> bit_1
- bit_0 = x

开始统计。

- 高16位有1，低16位是需要被计数的位，bit_16的值是16，可以累加起来。
  - 同时高8位有1，低24位是需要被计数的位，bit_8的值是8，再累加起来就是24。
  - 同时高8位没有1，高16位的低8位还需要进一步判断，bit_8的值是0，累加起来结果不变。
- 高16位没有1，低16位还需进一步判断，bit_16的值是0，累加起来结果不变。
  - 同时高8位有1，低8位是需要被计数的位，bit_8的值是8，累加起来结果就是8。
  - 同时高8位没有1，低8位需要进一步判断，bit_8的值是0，累加起来结果不变。

所以bit_0 + ... + bit_16就是除符号位之外的有效位数。最终结果再+1即可。

```c
/* howManyBits - return the minimum number of bits required to represent x in
 *             two's complement
 *  Examples: howManyBits(12) = 5
 *            howManyBits(298) = 10
 *            howManyBits(-5) = 4
 *            howManyBits(0)  = 1
 *            howManyBits(-1) = 1
 *            howManyBits(0x80000000) = 32
 *  Legal ops: ! ~ & ^ | + << >>
 *  Max ops: 90
 *  Rating: 4
 */
int howManyBits(int x) {
  int signX = x >> 31;
  x = (signX&~x) | (~signX&x);

  int signX16 = !!(x >> 16);
  int bit_16 = signX16 << 4;
  x = x >> bit_16;

  int signX8 = !!(x >> 8);
  int bit_8 = signX8 << 3;
  x = x >> bit_8;

  int signX4 = !!(x >> 4);
  int bit_4 = signX4 << 2;
  x = x >> bit_4;

  int signX2 = !!(x >> 2);
  int bit_2 = signX2 << 1;
  x = x >> bit_2;

  int signX1 = !!(x >> 1);
  int bit_1 = signX1;
  x = x >> bit_1;

  int bit_0 = x;

  return bit_16 + bit_8 + bit_4+ bit_2 + bit_1 + bit_0 + 1;
}
```

## 浮点数

接下来的三个题目是关于浮点数的，浮点数的表示要比整数复杂很多，先梳理一下计算机如何表示浮点数是非常有必要的。

现在主流的浮点数表示方法是由IEEE定制的，用一个公式来表示浮点数的值的话是这样的

$$V=(-1)^s\*M\*2^E$$

- s代表符号，和整数补码一样1代表负数，0代表正数
- M代表尾数，它是一个二进制小数
- E代表阶码，对浮点数加权

下面通过浮点数的位表示，举例进一步解释

浮点数被划分为3个字段，对于一个32位的float类型，最高位是符号位，紧接着的8位是阶码位，最后的23位是小数位。对于64位的double类型，这三个数字分别为1、11，52。

根据阶码位内容的不同，浮点数分成3类。

- 阶码不全为0也不全为1

  这种情况称为规格化的值，比如某浮点数f的位表示为 0 00000011 0000000000000000000001，E = e - Bias。其中e为阶码的值也就是00000011

  $$Bias = 2^{k-1} - 1$$

  其中k为阶码的位数，在这里是8。所以Bias = 127，E = 3-127 = -124。

  小数位是0000000000000000000001，M = 1 + f,其中

  $$f=1/(2^{23})$$

  1代表小数位的值是1，23是代表小数位的位数是23。所以

  $$M=1+(1/2^{23})$$

  0是符号位，代表是正数。最后套用公式

  $$V=(-1)^s\*M\*2^E$$

  V就是最终值。

- 阶码位全为0

  这种情况称为非规格化的值，此时 E = 1 - Bias。M = f，其他和第一种情况相同。

- 阶码位全为1

  这种情况代表特殊值，小数全为0代表无穷，小数不全为0代表NaN（Not a Number）。

## 十一：浮点数的位级表示2\*f

```c
//float
/*
 * floatScale2 - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatScale2(unsigned uf) {
  return 2;
}
```

返回表达式2\*f的值，参数和返回值都是unsigned int类型，但是他们需要被解读为float的位级表示，当入参为NaN时，返回该参数，可以使用任何整数操作，也可以使用||、 &&、if、while

- 规格化的值

  根据公式

  $$V=(-1)^s\*M\*2^E$$

  把E + 1 就相当于\*2，根据上面的定义就相当于把阶码 + 1。

  先截取出浮点数三个字段。

  sign = (uf >> 31) & 1, expr = (uf >>23) & (0xff), frac = uf & 0x7fffffff。

  expr ++ 后，再把它拼接回去即可。拼接方法: (sign << 31) | (expr << 23) | frac

- 非规格化的值

  这个时候不能把E+1，因为那样就变成了规格化的值了，E和M的计算方式就发生变化了，所以我们只能改变M，让M变为原来的二倍。让M变为两倍实际上就是让小数位变为两倍，把小数位整体左移一位，再拼接即可，拼接方法: (sign << 31) | (expr << 23) | (frac << 1)。

- 特殊值

  根据题目要求，NaN时原样返回。除了NaN，另一种情况就是无穷，无穷\*2依然是无穷，所以也可以原样返回。

```c
/*
 * floatScale2 - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatScale2(unsigned uf) {
  unsigned sign = (uf >> 31) & 1;
  unsigned expr = (uf >>23) & 0xff;
  unsigned frac = uf & 0x7fffff;

  if (expr == 0xff) {
    return uf;
  } else if (expr == 0)
  {
    return (sign << 31) | (expr << 23) | (frac << 1);
  } else {
    expr ++;
    return (sign << 31) | (expr << 23) | frac;
  }
}
```

## 十二：浮点数的位级表示int(f)

```c
/* 1010
 * floatFloat2Int - Return bit-level equivalent of expression (int) f
 *   for floating point argument f.
 *   Argument is passed as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point value.
 *   Anything out of range (including NaN and infinity) should return
 *   0x80000000u.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
int floatFloat2Int(unsigned uf) {
  return 2;
}
```

返回的等价表达式(int) f的值，任何溢出的情况返回0x80000000u（包括NaN and infinity），可以使用任何整数操作，也可以使用||、 &&、if、while

首先还是对三种情况分别讨论

- 规格化的值

  $$V=(-1)^s\*M\*2^E$$

  根据M的计算公式，M一定是一个1-2之间的一个数。先不管符号，其实最终值就是把M向右移动E位。转化为int就相当于抛弃位移后的结果的小数位。因为int类型一共32位，考虑到符号位占1位，所以E > 30 时，就会发生溢出，返回0x80000000u。

  $$\color{#FF3030}{我把判断条件写成E > 31时，也通过了单元测试，是否是出题人的失误？}$$

  E < 0 时，最终结果的绝对值一定小于1，转化为int就是0。

  其他的情况需要考虑M的值是多少，因为

  $$M = 1 + f，f=1/(frac的值^{frac的位数})$$

  用二进制表述M时，小数部分就是frac的位表示。再frac最高位前面补一个1，就是M不考虑小数点的样子它等价于M>>23。右移23位的M应该长这个样子。

  $$M=frac | (1 << 23)$$

  此时我们在根据E的值对他进行修正，E >= 23时，代表M小了，需要左边补 E - 23 个0，E < 23时代表M大了，需要丢弃低位。

  最后需要考虑符号位，如果是正数，那就原样返回，如果是负数，就返回相反数。

- 非规格化的值

  非规格化的最大值就是符号位是0，小数位都是1，套入公式计算得

  $$1.2\*10^{-38}$$

  符号位改为1就是最小数，转化为int都应该是0。

- 特殊值

  根据题目要求，NaN和infinity都返回0x80000000u

```c
/* 1010
 * floatFloat2Int - Return bit-level equivalent of expression (int) f
 *   for floating point argument f.
 *   Argument is passed as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point value.
 *   Anything out of range (including NaN and infinity) should return
 *   0x80000000u.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
int floatFloat2Int(unsigned uf) {
  unsigned sign = (uf >> 31) & 1;
  unsigned expr = (uf >>23) & 0xff;
  unsigned frac = uf & 0x7fffff;
  if (expr == 0xff) {
    return 0x80000000u;
  }
  if (expr == 0)
  {
    return 0;
  }
  int E = expr - 127;
  if (E > 30) {
    return 0x80000000u;
  }
  if (E < 0)
  {
    return 0;
  }
  int M = frac | (1 << 23);
  if (E >= 23){
    M <<= (E -23);
  } else {
    M >>= (23 -E);
  }
  if (!sign) {
    return M;
  }
  return ~M + 1;
}
```

## 十三：浮点数的位级表示2.0^x

```c
/*
 * floatPower2 - Return bit-level equivalent of the expression 2.0^x
 *   (2.0 raised to the power x) for any 32-bit integer x.
 *
 *   The unsigned value that is returned should have the identical bit
 *   representation as the single-precision floating-point number 2.0^x.
 *   If the result is too small to be represented as a denorm, return
 *   0. If too large, return +INF.
 *
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. Also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatPower2(int x) {
    return 2;
}
```

返回的等价表达式2.0^x的值，如果结果太小返回0，太大返回+INF，可以使用任何整数操作，也可以使用||、 &&、if、while。

首先需要确定最大值和最小值，并且2的x次方一定是正数，所以我么需要找到最接近0的那个值作为最小值，而不是负数。特殊值是用来表示无穷或者NaN的，在本题都无法表示，不做考虑。所以我们分别看规格化的值与非规格化的值。

- 规格化

  - 最大值

    阶码是11111110，小数位全是1，这个值是

    $$(2 - 2^{-23}) \* 2 ^{127}$$
    其中左半部分
    $$(2 - 2^{-23})$$

    是一个很接近2的数字，所以整个表达式是一个接近2的128次方的数，也就是说x要小于128

  - 最小值

    阶码是00000001，小数位全是0，这个值是

    $$2^{-126}$$

- 非规格化

  - 最大值

    小数位全是1，其他位全是0，是一个接近

    $$2^{-126}$$

    的值

  - 最小值

    最小的正非规格化的值为最低位是1其他全是0，这个值是

    $$2^{-23} * 2^{-126} = 2^{-149}$$

**综上所述**

- x > 128时，return +INF。
- -126 <= x <= 127时，要按照规格化的表示来解释。根据公式

  $$V=-1^s\*M\*2^E$$

  此时需要让s=0，M=1，E=x。

- -149 <= x < -126，要按照非规格化的表示来解释。根据公式

  $$V=-1^s\*M\*2^E$$

  因为是正数s=0，E=-126，所以M=2^{x+126}，相当于小数位的值是

  $$2^{x+126}$$

  比如x=-149时，我们可以通过计算

  $$2^{-149+126} \* 2^{-126}$$

  得到结果。

- x < -149时，return 0。

```c
/*
 * floatPower2 - Return bit-level equivalent of the expression 2.0^x
 *   (2.0 raised to the power x) for any 32-bit integer x.
 *
 *   The unsigned value that is returned should have the identical bit
 *   representation as the single-precision floating-point number 2.0^x.
 *   If the result is too small to be represented as a denorm, return
 *   0. If too large, return +INF.
 *
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. Also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatPower2(int x) {
    if (x < -149){
      return 0;
    } else if (x < -126)
    {
      // s =0,e=0,
      int shift = 23 + (x + 126);
      return 1 << shift;
    } else if (x <= 127)
    {
      // x = E
      // E = e - Bias
      int e = x + 127;
      // s = 0 f = 0
      return e << 23;
    }
    return (0xff) << 23;
}
```
