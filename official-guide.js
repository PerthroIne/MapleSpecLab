/* MapleSpecLab official guide reference layer.
 * Source: https://maplestoryidle.nexon.com/ko/guide
 * Verified against the guide updated on 2026-08-08.
 */
(function () {
  const sourceUrl = "https://maplestoryidle.nexon.com/ko/guide";
  const sourceLabel = "메이플 키우기 공식 가이드";

  const common = {
    sourceUrl,
    sourceLabel,
    verifiedAt: "2026-08-08",
    guideUpdatedAt: "2026-08-08"
  };

  const stats = {
    attack: { title: "공격력", summary: "적에게 입히는 각종 피해의 기준입니다. 공격력에 스킬 계수와 각종 피해 배율이 적용됩니다.", detail: "공격력·주스탯·방어력·최대 HP/MP 계열은 고정값을 합산한 뒤 % 배율을 적용하는 순서가 사용됩니다.", section: "능력치 사전 · 1.1" },
    attack_pct: { title: "공격력 %", summary: "합산된 공격력 고정값에 적용되는 비율 계열입니다.", detail: "공식 가이드의 ‘합 + 배율’ 원칙에 따라 고정값 합산 후 해당 % 배율이 적용됩니다.", section: "1.1 능력치가 합쳐지는 방식" },
    main_stat: { title: "주스탯", summary: "직업별 주 스탯은 공격력과 스탯 비례 데미지에 기여합니다.", detail: "STR·DEX·INT·LUK 중 직업에 맞는 값이 사용됩니다. 연구소는 직업별 세부 변환식 전체를 재현하지 않습니다.", section: "능력치 사전" },
    main_stat_pct: { title: "주스탯 %", summary: "합산된 주스탯 고정값에 적용되는 비율 계열입니다.", detail: "공식 가이드의 ‘합 + 배율’ 원칙에 따라 고정값 합산 후 해당 % 배율이 적용됩니다.", section: "1.1 능력치가 합쳐지는 방식" },
    critical_rate: { title: "크리티컬 확률", summary: "공격이 크리티컬로 적용될 확률입니다.", detail: "연구소의 기대값 비교에서는 100%까지만 반영합니다. 공식 PVP 방어 보정에서도 크리티컬 확률은 최대 100%까지 반영됩니다.", section: "능력치 사전 · 4.2" },
    critical_damage: { title: "크리티컬 데미지", summary: "크리티컬이 발생했을 때 적용되는 피해 배율입니다.", detail: "실제 기대 피해는 크리티컬 확률과 함께 봐야 합니다. PVP 방어 보정은 두 값을 이용한 평균값을 사용합니다.", section: "능력치 사전 · 4.2" },
    attack_speed: { title: "공격 속도", summary: "스킬 진행 속도와 일부 연계 지연을 빠르게 하여 시간당 공격 횟수에 영향을 줍니다.", detail: "체감 누적 방식이며 150%를 초과할 수 없습니다. 상한에 가까울수록 같은 수치를 추가해도 실제 증가량이 줄어듭니다.", cap: "공식 상한 150%", section: "1.1 · 1.2 · 4.1" },
    damage: { title: "데미지", summary: "피해를 증가시키는 데미지류 능력치입니다.", detail: "공식 일반 피해 순서에서 (1 + 데미지) 배율로 적용됩니다. 같은 종류의 기본 수치는 합산됩니다.", section: "능력치 사전 · 1.3" },
    damage_amp: { title: "데미지 증폭", summary: "피해를 증가시키는 데미지류 능력치입니다.", detail: "공식 일반 피해 순서에서 데미지와 별도의 (1 + 데미지 증폭) 배율로 반영됩니다.", section: "능력치 사전 · 1.3" },
    basic_damage: { title: "기본 공격 데미지", summary: "기본 공격으로 주는 피해를 늘립니다.", detail: "기본 공격에만 적용되는 전용 배율입니다. 스킬 데미지와 적용 대상이 다릅니다.", section: "능력치 사전 · 1.3" },
    skill_damage: { title: "스킬 데미지", summary: "스킬로 주는 피해를 늘립니다.", detail: "스킬 공격에만 적용되는 전용 배율입니다. 기본 공격 데미지와 적용 대상이 다릅니다.", section: "능력치 사전 · 1.3" },
    defense_pen: { title: "방어 관통력", summary: "공격 시 대상의 방어력을 일정 비율 무시합니다.", detail: "체감 누적 방식이며 100% 이상으로 적용되지 않습니다. 대상 방어력과 콘텐츠 규칙이 없으면 정확한 실전 효율을 단일 수치로 확정할 수 없습니다.", cap: "공식 적용 상한 100%", section: "1.1 · 1.2 · 1.3" },
    boss_damage: { title: "보스 몬스터 데미지", summary: "보스 몬스터에게 가하는 데미지를 증가시킵니다.", detail: "보스에게만 적용되는 대상 전용 배율입니다.", section: "능력치 사전 · 1.3" },
    normal_damage: { title: "일반 몬스터 데미지", summary: "일반 몬스터에게 가하는 데미지를 증가시킵니다.", detail: "일반 몬스터에게만 적용되는 대상 전용 배율입니다.", section: "능력치 사전 · 1.3" },
    min_damage: { title: "최소 데미지 배율", summary: "각 타격 피해가 정해지는 최소 범위입니다.", detail: "최소·최대 데미지 배율 사이에서 타격 피해가 정해집니다. PVP 보정은 두 값의 평균을 사용하며 최소값이 최대값보다 높으면 최대로 적용됩니다.", section: "능력치 사전 · 4.2" },
    max_damage: { title: "최대 데미지 배율", summary: "각 타격 피해가 정해지는 최대 범위입니다.", detail: "최소·최대 데미지 배율 사이에서 타격 피해가 정해집니다. 공식식 기준 피해 지수는 두 값의 평균을 사용합니다.", section: "능력치 사전 · 4.2" },
    final_damage: { title: "최종 데미지", summary: "각 효과가 서로 곱해져 적용되는 피해 증가 능력치입니다.", detail: "예를 들어 서로 다른 20%와 30% 효과는 1.2 × 1.3 = 1.56배로 적용됩니다.", section: "1.1 능력치가 합쳐지는 방식" },
    mos_level: { title: "모스렙", summary: "기존 비교 모델과 프로필 호환을 위해 유지한 연구소 입력 항목입니다.", detail: "공식 능력치 사전의 표준 명칭과 직접 대응이 확인되지 않았습니다. 게임 내 실제 옵션 명칭과 값을 우선 확인하세요.", section: "연구소 호환 항목", limitation: true },
    third_level: { title: "3차 스킬 레벨", summary: "3차 직업 스킬의 레벨을 올립니다.", detail: "공식 전투력 계산에도 스킬 레벨 항목이 포함되지만, 실제 피해는 스킬별 계수와 특성에 따라 달라집니다.", section: "능력치 사전 · 3.1" },
    fourth_level: { title: "4차 스킬 레벨", summary: "4차 직업 스킬의 레벨을 올립니다.", detail: "공식 전투력 계산에도 스킬 레벨 항목이 포함되지만, 실제 피해는 스킬별 계수와 특성에 따라 달라집니다.", section: "능력치 사전 · 3.1" },
    all_skill_level: { title: "모든 스킬 레벨", summary: "보유한 모든 적용 대상 스킬의 레벨을 올립니다.", detail: "스킬마다 적용 대상과 계수가 다르므로 연구소의 통합 비교값은 참고용입니다.", section: "능력치 사전 · 3.1" },
    status_damage: { title: "상태이상 데미지", summary: "빙결·기절·무력화 등 상태이상에 걸린 적에게 주는 피해를 늘립니다.", detail: "대상이 해당 상태일 때만 공식 일반 피해 계산에 반영됩니다. 연구소는 미적용·상시 적용 또는 전투시간 대비 적용 횟수와 1회 유지시간으로 유효 적용률을 계산하며 최대 100%까지만 반영합니다.", section: "능력치 사전 · 1.3", limitation: true },
    hp: { title: "최대 HP", summary: "생존의 기준이 되는 능력치입니다. 남은 HP가 0이 되면 전투 불능이 됩니다.", detail: "공식 전투력 및 일부 최대 HP 비례 피해에 사용됩니다. 현재 공식식 기준 공격 피해 지수에는 직접 반영되지 않습니다.", section: "능력치 사전 · 2.3 · 3.1", limitation: true },
    accuracy: { title: "명중", summary: "공격이 빗나가지 않게 하는 능력치입니다.", detail: "명중과 상대 회피의 차이로 판정됩니다. 회피가 명중보다 100 높을 때 회피 확률은 70%이며 그 이상을 초과하지 않습니다.", section: "1.2 · 능력치 사전", limitation: true },
    evasion: { title: "회피", summary: "상대 공격을 빗나가게 하는 능력치입니다.", detail: "상대 명중과의 차이로 판정됩니다. 현재 공식식 기준 공격 피해 지수에는 상대 명중과 콘텐츠 조건이 없어 직접 반영되지 않습니다.", cap: "회피 확률 상한 70%", section: "1.2 · 능력치 사전", limitation: true }
  };

  const topics = {
    comparisonModel: { title: "공식식 기준 피해 지수", summary: "공식 가이드의 일반 피해 계산 순서를 우선 적용해 변경 전후의 상대 차이를 비교하는 값입니다.", detail: "공격력, 선택적 방어력 보정, 데미지류, 대상·공격 유형 보너스, 크리티컬 기대값, 평균 데미지 배율, 상태이상 유효 적용률과 최종 데미지를 반영합니다. 받는 피해 효과·콘텐츠 보정·스킬 계수·마스터리 등 입력하지 않은 변수는 없는 것으로 계산하므로 공식 전투력이나 실제 DPS는 아닙니다.", section: "공식 가이드 1.1 · 1.3 · 2 · 3.1", limitation: true },
    ocr: { title: "OCR 입력", summary: "OCR은 숫자 입력을 돕는 보조 기능이며 공식 판정 기능이 아닙니다.", detail: "해상도, 글꼴, 배경, 잘림 상태에 따라 항목명·부호·소수점이 틀릴 수 있습니다. 적용 전 원본 화면과 반드시 대조하세요.", section: "연구소 입력 안내", limitation: true },
    equipment: { title: "장비·어빌 비교", summary: "현재 A와 변경 B의 차이(B − A)를 현재 스펙에 반영합니다.", detail: "옵션 누적 방식은 능력치마다 다릅니다. 공격 속도·방어 관통력 등 체감 누적 능력치는 단순 합산값과 게임 내 최종 표시값이 다를 수 있습니다.", section: "공식 가이드 1.1", limitation: true },
    companions: { title: "동료 능력치", summary: "동료는 소환 시점의 플레이어 전투 능력치를 기준으로 생성됩니다.", detail: "공격력 계승 비율은 동료 레벨에 따라 증가하나 90%를 초과할 수 없습니다. 캐릭터 레벨이 전직 기준(2차 30·3차 60·4차 100)보다 낮으면 추가 감소하며, 재사용 대기시간 감소·스킬 레벨·기본 공격 대상 수·버프 지속시간 등 일부 능력치는 동료 전투에 적용되지 않습니다.", cap: "공격력 계승 비율 상한 90%", section: "2.5 동료 능력치" },
    officialPower: { title: "공식 전투력과 실전 결과", summary: "전투력은 성장 상태를 비교하기 위한 공식 지표입니다.", detail: "공식 가이드는 전투력에 반영되지 않는 성장 요소와 상황별 변수가 존재한다고 안내합니다. MapleSpecLab은 공식 전투력 계산기가 아니며, 현재 입력 항목만으로 공식 전투력 전체 식을 재현하지 않습니다.", section: "3.1 전투력 계산식 안내", limitation: true }
  };

  window.MAPLE_OFFICIAL_GUIDE = { ...common, stats, topics };
})();
